##Načrtovanje naloge

Navodila

V sklopu vaj si boste ustvarili svoj lasten javni repozitorij na spletnem mestu za vodenje različic GitHub.com.

Tekom sledečih vaj boste razvili mikrostoritveni sistem, ki bo obsegal tri mikrostoritve in spletno aplikacijo, ki bo služila kot uporabniški vmesnik. Temu primerno uredite vaš repozitorij, pri čemer bodite pozorni na:

    Strukturo repozitorija (ločitev posameznih storitev, jasno poimenovanje map in datotek),
    Opis projekta (README.md, kjer opišete namen in arhitekturo rešitve),
    Dosledno uporabo različic (uporaba Git-a za sledenje spremembam).

Arhitekturna načela

Pri načrtovanju in implementaciji vašega sistema sledite načelom čiste arhitekture (Clean Architecture), ki poudarja:

    Neodvisnost domene – poslovna logika sistema mora biti neodvisna od infrastrukture (podatkovne baze, zunanjih sistemov, API-jev).
    Ohlapna sklopljenost – mikrostoritve morajo biti samostojne enote, ki komunicirajo prek jasnih API-jev.
    Odvisnosti morajo teči od zunanjosti proti notranjosti – zunanje tehnologije (frameworki, knjižnice) ne smejo neposredno vplivati na poslovno logiko.

Vaš repozitorij mora odražati "screaming architecture", kar pomeni, da mora že struktura map in datotek jasno prikazovati namen sistema, ne pa tehnologij, ki jih uporabljate. Namesto generičnih imen, uporabite imena, ki opisujejo poslovne koncepte sistema.

##NALOGA 1:

Implementirali boste prvo mikrostoritev vašega načrtovanega informacijskega sistema.

Za implementacijo boste uporabili eno izmed izbranih tehnologij (❗Ne pozabite, da mora vsaka storitev biti implementirana v drugi tehnologiji❗, sledite dobrim praksam razvoja za izbrano tehnologijo).

Mikrostoritvi zagotovite sledeče:

- Implementacija načrtovanih funkcionalnosti⚠️

- Poljubna podatkovna baza za hranjenje podatkov

- Med delovanjem mikrostoritve poskrbite za izpisovanje log-ov . Prav tako je potrebno vse implementirane funkcionalnosti podpreti s testiranjem, ki se izvede v cevovodu (npr.: UnitTest)

  potestirati je potrebno vsaj repozitorij in vse končne točke.

- Vaši mikrostoritvi dodajte datoteko Dockerfile, ki bo omogočala lažjo gradnjo Docker slik.

  Dodajte docker-compose

- OpenAPI (npr.: Swagger)

- ...

Primer:

Shema_2

Uporaba GitHub Actions GitHub Actions
Vaš repozitorij dopolnite, da boste uporabljali GitHub Actions:

- workflow naj zaenkrat ob ukazu push izvede teste, ki ste jih napisali v vaši mikrostoritvi❕

##Naloga 2:

Navodilo naloge:

Implementirali boste drugo mikrostoritev vašega načrtovanega informacijskega sistema.

Za implementacijo boste uporabili eno izmed izbranih tehnologij (❗Ne pozabite, da mora vsaka storitev biti implementirana v drugi tehnologiji❗, sledite dobrim praksam razvoja za izbrano tehnologijo). Pri implementaciji mikrostoritve uporabite gRPC.

Mikrostoritvi zagotovite sledeče:

- Implementacija načrtovanih funkcionalnosti⚠️

- Poljubna podatkovna baza za hranjenje podatkov

- Med delovanjem mikrostoritve poskrbite za izpisovanje log-ov . Prav tako je potrebno vse implementirane funkcionalnosti podpreti s testiranjem (npr.: UnitTest).

- Vaši mikrostoritvi dodajte datoteko Dockerfile, ki bo omogočala lažjo gradnjo Docker slik.

- ...

Uporaba GitHub Actions GitHub Actions
Vaš repozitorij dopolnite, da boste uporabljali GitHub Actions:

- workflow naj zaenkrat ob ukazu push izvede Unit teste, ki ste jih napisali v vaši mikrostoritvi❕

##NALOGA 3:

Navodilo naloge:

Implementirali boste tretjo mikrostoritev vašega načrtovanega informacijskega sistema.

Za implementacijo boste uporabili eno izmed izbranih tehnologij (❗Ne pozabite, da mora vsaka storitev biti implementirana v drugi tehnologiji❗, sledite dobrim praksam razvoja za izbrano tehnologijo). Uporabili boste reaktiven slog programiranja ⚡️. V vaši mikrostoritveni arhitekturi uporabite sporočilnega posrednika (npr.: ActiveMQ).

Mikrostoritvi zagotovite sledeče:

- Implementacija načrtovanih funkcionalnosti⚠️

- Poljubna podatkovna baza za hranjenje podatkov

- Med delovanjem mikrostoritve poskrbite za izpisovanje log-ov . Prav tako je potrebno vse implementirane funkcionalnosti podpreti s testiranjem (npr.: UnitTest).

- Vaši mikrostoritvi dodajte datoteko Dockerfile, ki bo omogočala lažjo gradnjo Docker slik.

- OpenAPI (npr.: Swagger)

- ...

Uporaba GitHub Actions GitHub Actions
Vaš repozitorij dopolnite, da boste uporabljali GitHub Actions:

- workflow naj zaenkrat ob ukazu push izvede Unit teste, ki ste jih napisali v vaši mikrostoritvi❕

##Naloga 4

Dopolnite vašo mikrostoritveno arhitekturo z vpeljavo vzorca Prehod API (angl.: API Gateway).

Mikrostoritveni arhitekturi zagotovite sledeče:
Ustvarite prehod, ki bo enotna vstopna točka za odjemalce.

Potrebno je ustvariti vsaj dva prehoda, na primer: en je namenjen spletnem odjemalcu in en mobilnemu (vsak v drugi tehnologiji in z drugačnimi izpostavljenimi končnimi točkami)❗

Ne pozabite, da je na prehodih potrebno implementirati vse končne točke, ki jih boste potrebovali v vašem spletnem/mobilnem odjemalcu.

Delovanje prehodov lahko zaenkrat demonstrirate na poljuben način (npr.: Postman).

Dodatno gradivo za nalogo 4: bff.pdf

##Naloga 5:

Navodilo naloge:

1. Dopolnite vašo mikrostoritveno arhitekturo z odjemalcem v obliki spletnega uporabniškega vmesnika.
2. Vaše cevovode (angl.: pipelines) na GitHub Actions dopolnite z gradnjo in objavo zabojniških slik na DockerHub.

Mikrostoritveni arhitekturi zagotovite sledeče:
Ustvarite spletno aplikacijo, ki bo služila kot odjemalce.

Spletno aplikacijo razvijte po arhitekturnem stilu Micro Frontends❗

Uporabniški vmesnik naj omogoča testiranje vseh funkcionalnosti, ki jih ponujajo mikrostoritve v zalednem sistemu🚨

Zgraditi in objaviti je potrebno zabojniške slike vseh komponent vaše mikrostoritvene arhitekture.
