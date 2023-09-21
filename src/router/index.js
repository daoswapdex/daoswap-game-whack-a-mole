import Vue from "vue";
import VueRouter from "vue-router";
import WhackAMole from "../views/game/WhackAMole.vue";
import WhackAMoleList from "../views/game/WhackAMoleList.vue";
import WhackAMoleListOfInviter from "../views/game/WhackAMoleListOfInviter.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/home/Index.vue"),
    children: [
      {
        path: "",
        name: "Home",
        redirect: "/whack-a-mole",
        component: () => import("@/views/home/Index.vue")
      },
      {
        path: "/whack-a-mole",
        name: "WhackAMole",
        redirect: "/whack-a-mole/join",
        component: () => import("@/layouts/home/ViewBlank.vue"),
        children: [
          {
            path: "/whack-a-mole/join",
            name: "JoinWhackAMole",
            component: WhackAMole
          },
          {
            path: "/whack-a-mole/list",
            name: "JoinWhackAMoleList",
            component: WhackAMoleList
          },
          {
            path: "/whack-a-mole/inviter",
            name: "JoinWhackAMoleListOfInviter",
            component: WhackAMoleListOfInviter
          }
        ]
      },
      {
        path: "/404",
        component: () => import("@/views/404.vue")
      },
      {
        path: "*",
        redirect: "/404"
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  scrollBehavior: (to, from, savedPosition) => {
    if (to.hash) return { selector: to.hash };
    if (savedPosition) return savedPosition;

    return { x: 0, y: 0 };
  },
  routes
});

export default router;
