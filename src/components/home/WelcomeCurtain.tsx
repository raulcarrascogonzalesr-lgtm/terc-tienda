import { Terqui } from "@/components/Terqui";
import { SITE } from "@/lib/site";
import { CurtainCloser } from "./CurtainCloser";
import { WELCOME_KEY } from "./welcome-key";

// Cortina de bienvenida de la portada: Terqui saluda y la cortina se abre en 2 segundos.
// Solo aparece la primera vez (queda guardado en el navegador), se salta con un toque y no aparece
// con "reducir movimiento". El script decide antes de dibujar la página, así quien ya la vio no
// alcanza a verla ni un instante; sin JavaScript tampoco aparece.
const SCRIPT = `try{if(!localStorage.getItem("${WELCOME_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.welcome="show";window.__tercWelcomeAt=performance.now()}}catch(e){}`;

export function WelcomeCurtain() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div className="welcome" aria-hidden>
        <div className="welcome-half welcome-left" />
        <div className="welcome-half welcome-right" />
        <div className="welcome-center">
          <Terqui pose="hola" className="h-44 w-44 sm:h-52 sm:w-52" />
          <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight sm:text-5xl">
            ¡Bienvenido a <em className="not-italic text-mint">TERC</em>!
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">{SITE.slogan}</p>
        </div>
        <span className="welcome-skip">Toca para entrar</span>
        <CurtainCloser />
      </div>
    </>
  );
}
