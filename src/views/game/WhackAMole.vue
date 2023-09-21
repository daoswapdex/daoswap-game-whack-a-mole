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
                  {{ $t("Join Game") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text v-if="isOpen && !hasJoined">
                <v-card-text>
                  <v-row align="center">
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("Authorized quota") }}:
                      {{ accountAssets.allowanceAmount }}
                    </v-col>
                  </v-row>
                </v-card-text>
                <form>
                  <v-card-text> </v-card-text>
                  <v-card-actions class="justify-center">
                    <v-btn
                      large
                      color="#93B954"
                      dark
                      width="80%"
                      @click="
                        accountAssets.allowanceAmount &&
                        parseFloat(accountAssets.allowanceAmount) >=
                          parseFloat(joinAmount)
                          ? submit()
                          : handleApprove()
                      "
                    >
                      {{
                        accountAssets.allowanceAmount &&
                        parseFloat(accountAssets.allowanceAmount) >=
                          parseFloat(joinAmount)
                          ? $t("Join")
                          : $t("Approve")
                      }}
                    </v-btn>
                  </v-card-actions>
                </form>
              </v-card-text>
              <v-card-text v-else>
                <v-row align="center">
                  <v-col
                    v-if="isOpen && hasJoined"
                    class="subtitle-1"
                    cols="12"
                  >
                    {{ $t("This round has already been participated in") }}
                  </v-col>
                  <v-col v-if="!isOpen" class="subtitle-1" cols="12">
                    {{ $t("Not within the join time frame") }}
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
import { getContractByABI, weiToEther, etherToWei } from "@/utils/web3";
import { JSBI } from "@/utils/jsbi";
// 引入合约 ABI 文件
import ERC20_abi from "@/constants/contractJson/ERC20_abi.json";
import GameWhackAMole_ABI from "@/constants/contractJson/GameWhackAMole_abi.json";

export default {
  name: "GameWhackAMole",
  data: () => ({
    loading: false,
    DAOAddress,
    tokenSymbol: "DAO",
    // 表单数据
    joinToken: DAOAddress,
    joinAmount: 0,
    // 当前账户相关信息
    accountAssets: {
      balance: 0,
      allowanceAmount: 0
    },
    // 合约数据
    currentDayTimestamp: 0,
    startTime: 0,
    endTime: 0,
    hasJoined: false,
    isOpen: false,
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
      this.loading = true;
      try {
        await this.getContractInfo();
      } catch (error) {
        console.info(error);
      }
      this.loading = false;
    },
    // 获取合约信息
    async getContractInfo() {
      const contract = getContractByABI(
        GameWhackAMole_ABI,
        WhackAMoleContractAddress,
        this.web3
      );
      const joinToken = await contract.methods.joinToken().call();
      this.joinToken = joinToken;
      const joinAmount = await contract.methods.joinAmount().call();
      this.joinAmount = weiToEther(joinAmount, this.web3);
      // 查询当前账号余额
      const contractERC20 = getContractByABI(ERC20_abi, joinToken, this.web3);
      const balance = await contractERC20.methods
        .balanceOf(this.address)
        .call();
      const allowance = await contractERC20.methods
        .allowance(this.address, WhackAMoleContractAddress)
        .call();
      this.accountAssets.balance = weiToEther(balance, this.web3);
      this.accountAssets.allowanceAmount = weiToEther(allowance, this.web3);
      this.tokenSymbol = await contractERC20.methods.symbol().call();
      this.hasJoined = await contract.methods
        .hasJoined()
        .call({ from: this.address });
      // get start time
      this.startTime = await contract.methods.startTime().call();
      // get end time
      this.endTime = await contract.methods.endTime().call();
      const currentDate = new Date();
      const hoursNumber =
        parseInt(currentDate.getHours()) * 60 * 60 +
        parseInt(currentDate.getMinutes()) * 60 +
        parseInt(currentDate.getSeconds());
      this.isOpen =
        JSBI.lessThanOrEqual(
          JSBI.BigInt(this.startTime),
          JSBI.BigInt(hoursNumber)
        ) &&
        JSBI.greaterThanOrEqual(
          JSBI.BigInt(this.endTime),
          JSBI.BigInt(hoursNumber)
        );
    },
    // 授权
    handleApprove() {
      this.loading = true;
      // 执行合约
      getContractByABI(ERC20_abi, this.joinToken, this.web3)
        .methods.approve(
          WhackAMoleContractAddress,
          etherToWei(this.joinAmount, this.web3)
        )
        .send({ from: this.address })
        .then(() => {
          this.loading = false;
          this.operationResult.color = "success";
          this.operationResult.snackbar = true;
          this.operationResult.text = "Approve Success";
          this.getInfo();
        })
        .catch(e => {
          this.loading = false;
          console.info(e);
        });
    },
    // 提交
    async submit() {
      this.loading = true;
      if (
        parseFloat(this.joinAmount) <=
        parseFloat(this.accountAssets.allowanceAmount)
      ) {
        getContractByABI(
          GameWhackAMole_ABI,
          WhackAMoleContractAddress,
          this.web3
        )
          .methods.join()
          .send({ from: this.address })
          .then(() => {
            this.loading = false;
            this.operationResult.color = "success";
            this.operationResult.snackbar = true;
            this.operationResult.text = "Join Success";
            this.getInfo();
          })
          .catch(e => {
            this.loading = false;
            console.info(e);
          });
      } else {
        this.operationResult.color = "error";
        this.operationResult.snackbar = true;
        this.operationResult.text =
          "JoinForm.The amount exceeds the allowance amount";
        this.loading = false;
      }
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
