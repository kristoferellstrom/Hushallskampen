import type { ReactNode } from "react";

export const mobileNavItems = (showPrizes: boolean) =>
  ([
    {
      id: "kalender",
      label: "Kalender",
      icon: <img src="/mob/home_icon_mob.svg" alt="" aria-hidden="true" />,
    },
    {
      id: "sysslor",
      label: "Sysslor",
      icon: <img src="/mob/task_icon_mob.svg" alt="" aria-hidden="true" />,
    },
    {
      id: "godkannanden",
      label: "Godkännanden",
      icon: <img src="/mob/approved_icon_mob.svg" alt="" aria-hidden="true" />,
    },
    {
      id: "statistik",
      label: "Statistik",
      icon: <img src="/mob/stat_icon_mob.svg" alt="" aria-hidden="true" />,
    },
    showPrizes
      ? {
          id: "priser",
          label: "Priser",
          icon: <img src="/mob/prize_icon_mob.svg" alt="" aria-hidden="true" />,
        }
      : null,
  ].filter(Boolean) as { id: string; label: string; icon: ReactNode }[]);
