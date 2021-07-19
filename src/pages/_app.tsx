import { AppProps } from "next/app"
import { Header } from "../components/Header";

import '../styles/global.scss'

// se quiser que algo repita em todas as páginas, é nesse arquivo que se coloca
// sempre que o usuário trocar de tela, esse arquivo será recarregado
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp
