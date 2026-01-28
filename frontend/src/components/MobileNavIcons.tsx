import type { ReactNode } from "react";

export const mobileNavItems = (showPrizes: boolean) =>
  ([
    {
      id: "kalender",
      label: "Kalender",
      icon: <img src="/mob/home_icon_mob.svg" alt="Kalender" aria-hidden="true" decoding="async" width="22" height="22" />,
    },
    {
      id: "godkannanden",
      label: "Godkännanden",
      icon: (
        <img src="/mob/approved_icon_mob.svg" alt="Godkännanden" aria-hidden="true" decoding="async" width="22" height="22" />
      ),
    },
    {
      id: "sysslor",
      label: "Sysslor",
      icon: <img src="/mob/task_icon_mob.svg" alt="Sysslor" aria-hidden="true" decoding="async" width="22" height="22" />,
    },
    {
      id: "statistik",
      label: "Statistik",
      icon: <img src="/mob/stat_icon_mob.svg" alt="Statistik" aria-hidden="true" decoding="async" width="22" height="22" />,
    },
    showPrizes
      ? {
          id: "priser",
          label: "Priser",
          icon: <img src="/mob/prize_icon_mob.svg" alt="Priser" aria-hidden="true" decoding="async" width="22" height="22" />,
        }
      : null,
  ].filter(Boolean) as { id: string; label: string; icon: ReactNode }[]);
