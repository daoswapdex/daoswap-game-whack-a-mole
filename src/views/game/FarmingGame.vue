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
                  {{ $t("Claim DFT") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-card-text>
                  <v-row align="center">
                    <v-col class="subtitle-1" cols="12">
                      <p
                        style="margin: 0;"
                        @click="handleCopy(DFTToken, $event)"
                      >
                        {{ $t("DFT Token") }}: {{ DFTToken }}
                        <v-icon>mdi-content-copy</v-icon>
                      </p>
                    </v-col>
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("DFT can be claimed") }}:
                      {{ claimDFTAmount }}
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text> </v-card-text>
                <form
                  v-if="DFTRewardSwitch && isOpen && isSelected && !isClaim"
                >
                  <v-card-actions class="justify-center">
                    <v-btn
                      large
                      color="#93B954"
                      dark
                      width="80%"
                      @click="claimDFT()"
                    >
                      {{ $t("Claim") }}
                    </v-btn>
                  </v-card-actions>
                </form>
                <v-row align="center" v-else>
                  <v-col v-if="DFTRewardSwitch" class="subtitle-1" cols="12">
                    <div v-if="isOpen">
                      <div v-if="!isSelected && !isClaim">
                        {{ $t("The current account is not selected") }}
                      </div>
                      <div v-else>
                        {{ $t("DFT has been claimed") }}
                      </div>
                    </div>
                    <div v-else>
                      {{ $t("Not within the claim time frame") }}
                    </div>
                  </v-col>
                  <v-col v-else class="subtitle-1" cols="12">
                    {{ $t("Claim not yet enabled") }}
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card>
          <!-- 操作 -->
          <v-card class="fill-width mt-10">
            <v-card outlined>
              <v-card-title>
                <v-avatar size="24" class="mr-2">
                  <img :src="require('@/assets/logo.png')" alt="DAO" />
                </v-avatar>
                <span class="title font-weight-bold text-h5">
                  {{ $t("Exchange DAO") }}
                </span>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-card-text>
                  <v-row align="center">
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("DFT Balance") }}: {{ accountAssets.balance }}
                    </v-col>
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("Authorized quota") }}:
                      {{ accountAssets.allowanceAmount }}
                    </v-col>
                    <!-- ≈ &#8776; &asymp; -->
                    <v-col class="subtitle-1" cols="12">
                      {{ $t("Estimated DFT Price") }}: 1 DFT ≈
                      {{ DFTPrice }} DAO
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text> </v-card-text>
                <form v-if="parseFloat(accountAssets.balance) > 0">
                  <v-card-actions class="justify-center">
                    <v-btn
                      large
                      color="#93B954"
                      dark
                      width="80%"
                      @click="
                        accountAssets.allowanceAmount &&
                        parseFloat(accountAssets.allowanceAmount) >=
                          parseFloat(accountAssets.balance)
                          ? exchangeDAO()
                          : handleApprove()
                      "
                    >
                      {{
                        accountAssets.allowanceAmount &&
                        parseFloat(accountAssets.allowanceAmount) >=
                          parseFloat(accountAssets.balance)
                          ? $t("Exchange")
                          : $t("Approve")
                      }}
                    </v-btn>
                  </v-card-actions>
                </form>
                <v-row align="center" v-else>
                  <v-col class="subtitle-1" cols="12">
                    {{ $t("Insufficient balance") }}
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
  name: "FarmingGame",
  data: () => ({
    loading: false,
    DAOAddress,
    tokenSymbol: "DAO",
    // 合约信息
    contractInfo: {
      token: null
    },
    // 数据列表
    dataList: [],
    // 当前账户相关信息
    accountAssets: {
      balance: 0,
      allowanceAmount: 0
    },
    // 显示条件
    DFTRewardSwitch: false,
    isOpen: false,
    isSelected: false,
    isClaim: false,
    // DFT价格
    DFTToken: null,
    claimDFTAmount: 0,
    DFTPrice: 0,
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
    },
    chainId(chainId) {
      if (chainId) {
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
      // return "0x3DdcFc89B4DD2b33d9a8Ca0F60180527E9810D4B";
    },
    chainId() {
      return this.$store.state.web3.chainId;
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
      this.getContractInfoToken();
      await this.getContractInfo();
    },
    // 获取合约地址
    getContractInfoToken() {
      const contractInfoToken = WhackAMoleContractAddress.filter(
        info => info.chainId === parseInt(this.chainId)
      )[0];
      if (contractInfoToken) {
        this.contractInfo.token = contractInfoToken.address;
      }
    },
    // 获取数据列表
    async getContractInfo() {
      this.loading = true;
      const contract = getContractByABI(
        GameWhackAMole_ABI,
        this.contractInfo.token,
        this.web3
      );
      this.DFTToken = await contract.methods.DFTToken().call();
      // 查询当前账号余额
      const contractERC20 = getContractByABI(
        ERC20_abi,
        this.DFTToken,
        this.web3
      );
      const balance = await contractERC20.methods
        .balanceOf(this.address)
        .call();
      const allowance = await contractERC20.methods
        .allowance(this.address, this.contractInfo.token)
        .call();
      this.accountAssets.balance = weiToEther(balance, this.web3);
      this.accountAssets.allowanceAmount = weiToEther(allowance, this.web3);
      // 查询领取DFT条件
      const conditions = await contract.methods
        .queryConditionsOfClaimDFT()
        .call({
          from: this.address
        });
      this.DFTRewardSwitch = conditions[0];
      this.isOpen = conditions[1];
      this.isSelected = conditions[2];
      this.isClaim = conditions[3];
      // 查询可提取DFT数量
      const claimDFTAmount = await contract.methods.queryClaimDFTAmount().call({
        from: this.address
      });
      this.claimDFTAmount = this.isClaim
        ? 0
        : weiToEther(claimDFTAmount, this.web3);
      // 查询当前DFT价格
      const DFTPrice = await contract.methods.getDFTPrice().call();
      this.DFTPrice = weiToEther(DFTPrice, this.web3);
      this.loading = false;
    },
    // 提交
    async claimDFT() {
      this.loading = true;
      if (parseFloat(this.claimDFTAmount) > 0) {
        getContractByABI(GameWhackAMole_ABI, this.contractInfo.token, this.web3)
          .methods.claimDFT()
          .send({ from: this.address })
          .then(() => {
            this.loading = false;
            this.operationResult.color = "success";
            this.operationResult.snackbar = true;
            this.operationResult.text = "Claim Success";
            this.getInfo();
          })
          .catch(e => {
            this.loading = false;
            console.info(e);
          });
      } else {
        this.operationResult.color = "error";
        this.operationResult.snackbar = true;
        this.operationResult.text = "Insufficient DFT can be claimed";
        this.loading = false;
      }
    },
    // 授权
    handleApprove() {
      this.loading = true;
      // 执行合约
      getContractByABI(ERC20_abi, this.DFTToken, this.web3)
        .methods.approve(
          this.contractInfo.token,
          etherToWei(this.accountAssets.balance, this.web3)
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
    // 兑换
    async exchangeDAO() {
      this.loading = true;
      if (parseFloat(this.accountAssets.balance) > 0) {
        getContractByABI(GameWhackAMole_ABI, this.contractInfo.token, this.web3)
          .methods.exchangeDAO(
            etherToWei(this.accountAssets.balance, this.web3)
          )
          .send({ from: this.address })
          .then(() => {
            this.loading = false;
            this.operationResult.color = "success";
            this.operationResult.snackbar = true;
            this.operationResult.text = "Exchange Success";
            this.getInfo();
          })
          .catch(e => {
            this.loading = false;
            console.info(e);
          });
      } else {
        this.operationResult.color = "error";
        this.operationResult.snackbar = true;
        this.operationResult.text = "Insufficient balance";
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
