import { HydrateClient } from "~/trpc/server";

export default async function PrivacyPolicy() {
  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl p-6 text-gray-800">
        <h1 className="mb-6 text-4xl font-bold">Adatvédelmi szabályzat</h1>

        <p className="mb-4 leading-relaxed">
          Jelen adatvédelmi szabályzat célja, hogy tájékoztatást nyújtson arról,
          hogyan kezeljük a felhasználók személyes adatait a(z){" "}
          <strong>www.ratemyroommate.hu</strong> weboldalon.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          1. Adatkezelő adatai
        </h2>
        <p className="mb-4 leading-relaxed">
          Email: <strong>rmrm.owners@gmail.com</strong>
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          2. Kezelt személyes adatok köre
        </h2>
        <p className="mb-4 leading-relaxed">
          A weboldal használata során az alábbi adatokat gyűjthetjük:
        </p>
        <ul className="mb-4 list-inside list-disc leading-relaxed">
          <li>Felhasználónév, email cím (Google Auth által)</li>
          <li>IP-cím és böngészőinformációk</li>
          <li>Cookie-k által tárolt adatok (pl. bejelentkezés állapota)</li>
          <li>Kérdőívre adott válaszok (opcionálisan)</li>
        </ul>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          3. Adatkezelés jogalapja
        </h2>
        <p className="mb-4 leading-relaxed">
          Az adatkezelés az érintett hozzájárulásán (pl. bejelentkezéskor), vagy
          jogos érdekünkön alapul (pl. statisztikai célból történő adatgyűjtés,
          rendszerbiztonság).
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          4. Az adatkezelés célja
        </h2>
        <ul className="mb-4 list-inside list-disc leading-relaxed">
          <li>A felhasználói fiók létrehozása és kezelése</li>
          <li>A kvíz eredményeinek mentése és megjelenítése</li>
          <li>A felhasználói élmény javítása</li>
          <li>Weboldal működésének biztosítása</li>
        </ul>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          5. Sütik (cookie-k) kezelése
        </h2>
        <p className="mb-4 leading-relaxed">
          Weboldalunk a működéshez elengedhetetlen sütiket használ. Ezek a sütik
          nem igényelnek külön hozzájárulást. Harmadik féltől származó vagy
          marketing célú sütiket jelenleg nem használunk.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          6. Adattárolás időtartama
        </h2>
        <p className="mb-4 leading-relaxed">
          A személyes adatokat addig őrizzük meg, amíg a felhasználói fiók
          aktív, vagy amíg a megőrzésre jogszabály kötelez minket. A fiók
          törlésével az adatok is törlésre kerülnek.
        </p>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          7. Adattovábbítás és adatfeldolgozók
        </h2>
        <p className="mb-4 leading-relaxed">
          Az adatokat harmadik félnek nem továbbítjuk, kivéve:
        </p>
        <ul className="mb-4 list-inside list-disc leading-relaxed">
          <li>Szolgáltatók: pl. Supabase (adatbázis), Vercel (hoszting)</li>
          <li>Jogszabályban előírt esetekben hatóságoknak</li>
        </ul>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">
          8. Felhasználói jogok
        </h2>
        <p className="mb-4 leading-relaxed">A felhasználók jogosultak:</p>
        <ul className="mb-4 list-inside list-disc leading-relaxed">
          <li>Tájékoztatást kérni az adatkezelésről</li>
          <li>Hozzáférni a saját adataikhoz</li>
          <li>Adataik helyesbítését vagy törlését kérni</li>
          <li>Az adatkezelés korlátozását kérni</li>
          <li>Adathordozhatóságot kérni</li>
        </ul>

        <h2 className="mt-8 mb-4 text-2xl font-semibold">9. Kapcsolat</h2>
        <p className="mb-4 leading-relaxed">
          Bármilyen adatkezeléssel kapcsolatos kérdés esetén fordulj hozzánk:
          <br />
          Email: <strong>rmrm.owners@gmail.com</strong>
        </p>

        <p className="mt-8 text-sm">
          Utolsó frissítés dátuma: <strong>2025.09.28</strong>
        </p>
      </div>
    </HydrateClient>
  );
}
