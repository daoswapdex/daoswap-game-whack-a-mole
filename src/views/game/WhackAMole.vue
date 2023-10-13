<template>
  <div class="fill-height">
    <v-container v-if="web3 && connected" class="fill-height">
      <v-row justify="center">
        <v-col md="6">
          <!-- 公告 -->
          <v-card justify="center" class="fill-width">
            <v-card-title>
              <span class="title font-weight-bold text-h5">
                {{ $t("Game Info") }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row align="center">
                <v-col class="body-1" cols="12">
                  <p>
                    {{ $t("Number of DAOs required for participation") }}：{{
                      joinAmount
                    }}
                    {{ tokenSymbol }}
                  </p>
                  <p>
                    {{ $t("Number of participants per round") }}：{{
                      maxNumberOfJoinPerRound
                    }}
                  </p>
                  <p>
                    {{ $t("Number of times participated on that day") }} /
                    {{
                      $t("Number of participation available on that day")
                    }}：{{ timesOfJoin.joinedTimes }} /
                    {{ timesOfJoin.canJoinTimes }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
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
              <v-card-text>
                <v-card-text>
                  <v-row align="center">
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("Number of participants in this round") }}:
                      {{ latestRoundInfo.accountList.length }} /
                      {{ maxNumberOfJoinPerRound }}
                    </v-col>
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("Authorized quota") }}:
                      {{ accountAssets.allowanceAmount }}
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text> </v-card-text>
                <form v-if="timesOfJoin.isCanJoin && !hasJoined">
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
                <v-row align="center" v-else>
                  <v-col class="subtitle-1" cols="12">
                    <div v-if="timesOfJoin.isCanJoin && hasJoined">
                      {{ $t("This round has already been participated in") }}
                    </div>
                    <div v-if="!timesOfJoin.isCanJoin">
                      {{
                        $t(
                          "You have reached the number of times you can participate"
                        )
                      }}
                    </div>
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
// 引入合约 ABI 文件
import ERC20_abi from "@/constants/contractJson/ERC20_abi.json";
import GameWhackAMole_ABI from "@/constants/contractJson/GameWhackAMole_abi.json";

export default {
  name: "GameWhackAMole",
  data: () => ({
    loading: false,
    DAOAddress,
    tokenSymbol: "DAO",
    rewardTokenSymbol: "DST",
    // 表单数据
    joinToken: DAOAddress,
    joinAmount: 0,
    maxNumberOfJoinPerRound: 0,
    timesOfJoin: {
      canJoinTimes: 0,
      joinedTimes: 0,
      isCanJoin: false
    },
    currentDate: 0,
    latestRoundInfo: {
      accountList: []
    },
    // 当前账户相关信息
    accountAssets: {
      balance: 0,
      allowanceAmount: 0
    },
    // 合约数据
    hasJoined: false,
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
      this.maxNumberOfJoinPerRound = await contract.methods
        .maxNumberOfJoinPerRound()
        .call();
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
      // 查询是否已参与本轮
      this.hasJoined = await contract.methods
        .hasJoined()
        .call({ from: this.address });
      // 查询参与次数
      const timesOfJoin = await contract.methods.getTimesOfJoin().call({
        from: this.address
      });
      this.timesOfJoin.canJoinTimes = parseInt(timesOfJoin[0]);
      this.timesOfJoin.joinedTimes = parseInt(timesOfJoin[1]);
      this.timesOfJoin.isCanJoin = timesOfJoin[2];
      // 查询本轮次信息
      const latestRoundId = await contract.methods.getLatestRoundId().call();
      const latestRoundInfo = await contract.methods
        .getRoundInfoById(latestRoundId)
        .call();
      this.latestRoundInfo.accountList = latestRoundInfo.accountList;
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
