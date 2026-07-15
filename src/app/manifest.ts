import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeHub — Life OS pessoal",
    short_name: "LifeHub",
    description:
      "Tarefas, projetos, hábitos, metas, estudos, pomodoro, finanças, diários e humor em um só lugar.",
    shortcuts: [
      { name: "Início", url: "/inicio" },
      { name: "Tarefas", url: "/atividades" },
      { name: "Pomodoro", url: "/pomodoro" },
      { name: "Finanças", url: "/financas" },
    ],
    id: "/",
    start_url: "/inicio",
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    background_color: "#0a0a0b",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
