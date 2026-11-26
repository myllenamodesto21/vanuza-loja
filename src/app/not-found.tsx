import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca-pequena.webp" alt="" className="mx-auto size-24 rounded-full" />
        <h1 className="mt-4 font-titulo text-3xl font-semibold">Não encontramos esta página</h1>
        <p className="mt-1 text-cacau">Talvez o produto tenha saído do catálogo.</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-full bg-chocolate px-6 text-creme">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
