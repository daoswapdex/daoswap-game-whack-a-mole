<template>
  <base-section id="affiliates" space="36">
    <v-container>
      <base-section-heading title="Who support DAOSWAP?" />

      <v-slide-group>
        <template v-for="n in 2">
          <v-slide-item :key="n" class="align-self-center">
            <base-img
              :src="
                require(`@/assets/logo-support-${n}-${
                  $vuetify.theme.isDark ? 'dark' : 'light'
                }.png`)
              "
              color="grey"
              contain
              height="40"
              width="128"
            />
          </v-slide-item>

          <v-responsive
            v-if="n < 2"
            :key="`divider-${n}`"
            class="text-center"
            height="56"
            width="48"
          >
            <v-divider vertical />
          </v-responsive>
        </template>
      </v-slide-group>
    </v-container>
  </base-section>
</template>

<script>
export default {
  name: "SectionAffiliates"
};
</script>
