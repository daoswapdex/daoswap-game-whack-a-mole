<template>
  <div class="fill-height">
    <v-container v-if="web3 && connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <!-- 操作 -->
          <v-card class="fill-width mt-10">
            <v-card outlined>
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DAO" />
                </v-avatar>
                <span class="title font-weight-bold text-h5">
                  {{ $t("Join Game Record") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text v-if="dataList.length > 0">
                <v-card
                  v-for="item in dataList"
                  :key="item.account"
                  :loading="loading"
                  class="ma-2"
                >
                  <v-card-title>
                    {{ $t("Joined Number") }} - {{ item.accountList.length }}
                  </v-card-title>
                  <v-divider class="mx-4"></v-divider>
                  <v-card-text>
                    <p>
                      {{ $t("Start Time") }}：{{
                        item.startTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
                      }}
                    </p>
                    <p>
                      {{ $t("Join Total Amount") }}：{{
                        item.joinTotalAmount | keepNumber
                      }}
                    </p>
                  </v-card-text>
                </v-card>
              </v-card-text>
              <v-card-text v-else>
                <v-row align="center">
                  <v-col class="body-3" cols="12">
                    {{ $t("No Data") }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
          <!-- 当前钱包账号 -->
          <v-card justify="center" class="fill-width mt-10">
            <v-card-title>
              <span class="title font-weight-bold text-h5">
                {{ $t("Current Token Address") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row align="center">
                <v-col
                  class="body-1"
                  cols="12"
                  @click="handleCopy(address, $event)"
                >
                  <p>
                    {{ address }}
                    <v-icon>mdi-content-copy</v-icon>
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 官方说明 -->
          <v-card justify="center" class="fill-width mt-10">
            <v-card-text>
              <v-row align="center">
                <v-col class="body-1" cols="12">
                  <p @click="handleCopy(DAOAddress, $event)">
                    DAO contract: {{ DAOAddress }}
                    <v-icon>mdi-content-copy</v-icon>
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <!-- 遮罩层 -->
          <v-overlay z-index="9999" opacity="0.7" :value="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <!-- 提示层 -->
          <v-snackbar
            v-model="operationResult.snackbar"
            :color="operationResult.color"
            centered
            top
            timeout="5000"
          >
            {{ $t(operationResult.text) }}
          </v-snackbar>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row justify="center">
        <v-col md="6">
          <v-card justify="center" class="fill-width">
            <v-card-actions class="justify-center">
              <!-- 连接钱包 -->
              <v-btn
                class="mr-2"
                v-if="!connected"
                color="#93B954"
                block
                @click="onConnect"
              >
                {{ $t("Connect Wallet") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import clip from "@/utils/clipboard";
import { DAOAddress, WhackAMoleContractAddress } from "@/constants";
import { getContractByABI, weiToEther } from "@/utils/web3";
import { compare } from "@/filters/index";
// 引入合约 ABI 文件
// import ERC20_abi from "@/constants/contractJson/ERC20_abi.json";
import GameWhackAMole_ABI from "@/constants/contractJson/GameWhackAMole_abi.json";

export default {
  name: "GameWhackAMoleList",
  data: () => ({
    loading: false,
    DAOAddress,
    tokenSymbol: "DAO",
    // 数据列表
    dataList: [],
    // 提示框
    operationResult: {
      color: "success",
      snackbar: false,
      text: `Hello`
    }
  }),
  created() {
    if (this.web3 && this.connected) {
      this.getInfo();
    } else {
      this.onConnect();
    }
  },
  watch: {
    web3(web3) {
      if (web3) {
        this.getInfo();
      }
    },
    address(address) {
      if (address) {
        this.getInfo();
      }
    }
  },
  computed: {
    connected() {
      return this.$store.state.web3.connected;
    },
    web3() {
      return this.$store.state.web3.web3;
    },
    address() {
      return this.$store.state.web3.address;
      // return "0xCD4BBF4FB76d400Eab42B9e530BB98BC72fFC20E";
    }
  },
  methods: {
    // 连接钱包 OK
    onConnect() {
      this.$store.dispatch("web3/connect");
    },
    // 断开连接钱包 OK
    closeWallet() {
      this.$store.dispatch("web3/closeWallet");
    },
    // 复制地址
    handleCopy(text, event) {
      clip(text, event);
      this.operationResult.color = "success";
      this.operationResult.snackbar = true;
      this.operationResult.text = "Cope Success";
    },
    // 获取信息
    async getInfo() {
      await this.getDataList();
    },
    // 获取数据列表
    async getDataList() {
      this.dataList = [];
      this.loading = true;
      const contract = getContractByABI(
        GameWhackAMole_ABI,
        WhackAMoleContractAddress,
        this.web3
      );
      const resResult = await contract.methods
        .getRoundList()
        .call({ from: this.address });

      const getResult = resResult.map(async item => {
        const tempData = {
          accountList: item.accountList,
          startTime: item.startTime,
          endTime: item.endTime,
          joinTotalAmount: weiToEther(item.joinTotalAmount, this.web3)
        };
        this.dataList.push(tempData);
      });
      await Promise.all(getResult);
      this.dataList.sort(compare("startTime"));

      this.loading = false;
    }
  }
};
</script>

<style lang="sass">
.theme--dark.v-btn.v-btn--disabled.v-btn--has-bg
  background-color: rgb(147, 185, 84) !important
  border-color: rgb(147, 185, 84) !important
  opacity: 0.5 !important

.v-btn--disabled
  background-color: rgb(147, 185, 84)
  border-color: rgb(147, 185, 84)
  opacity: 0.5
</style>
