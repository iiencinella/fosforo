---
tags:
  - proyecto/fosforo
  - legal
  - licencia
  - guia
type: guia-licencia
area: legal
status: vigente
created: 2026-05-18
updated: 2026-05-18
related:
  - "[[README|Legal y Licencias]]"
  - "[[../LICENSE|LICENSE]]"
  - "[[../NOTICE|NOTICE]]"
  - "[[RESPUESTAS-LICENCIA|Respuestas tipo para dudas de licencia]]"
---

# Licencia explicada en espanol

Esta guia resume en lenguaje claro el esquema legal del repositorio `fosforo`.

Importante: este documento es explicativo y no reemplaza el texto oficial de `LICENSE` ni los terminos oficiales de PolyForm Noncommercial 1.0.0 y CC BY-NC 4.0.

## Esquema general

El repositorio usa un modelo dual segun el tipo de material:

- Codigo fuente y scripts: `PolyForm Noncommercial 1.0.0`
- Contenido textual y multimedia: `CC BY-NC 4.0`

La forma correcta de describir publicamente el codigo del repositorio es `source-available`, comunitario y no comercial.

## Que permite en la practica

### Codigo fuente y scripts

En general, la licencia del codigo permite:

- usar el codigo para fines personales, educativos, pastorales, de investigación y otros fines no comerciales;
- estudiar, modificar y compartir el codigo dentro de esos usos permitidos;
- colaborar comunitariamente manteniendo avisos y condiciones de licencia.

En general, no permite:

- uso comercial por defecto;
- redistribuir el codigo quitando avisos de licencia o autoria;
- presentar el repositorio como Open Source OSI si mantiene la restricción no comercial.

### Contenido textual y multimedia

En general, la licencia del contenido permite:

- compartir contenido del proyecto para fines no comerciales;
- adaptar material segun los terminos de `CC BY-NC 4.0`;
- reutilizarlo siempre que se conserve la atribución exigida.

En general, no permite:

- explotación comercial por defecto;
- borrar creditos, autoria o avisos aplicables;
- incorporar contenido de terceros incompatible con este esquema.

## Que significa "uso comercial"

Como criterio general, se considera comercial todo uso orientado a ventaja comercial o compensación monetaria, directa o indirecta.

Si el caso es dudoso, conviene pedir revisión antes de usar el material. Para eso existe la plantilla `license-question.yml` en `.github/ISSUE_TEMPLATE/`.

## Atribución y autoria

El proyecto exige preservar autoria y procedencia cuando corresponda.

- `AUTHORS` registra reconocimiento de contribuidores.
- `NOTICE` resume avisos generales del repositorio.
- `ATTRIBUTIONS.md` registra contenido nuevo, adaptado, importado o de terceros.

Todo contenido textual o multimedia nuevo, adaptado o importado debe quedar asentado en `ATTRIBUTIONS.md` antes del merge, usando la plantilla obligatoria vigente.

## Si alguien quiere usar el proyecto

### Caso no comercial

Normalmente puede avanzar si:

- respeta la licencia aplicable;
- conserva avisos y atribución;
- no introduce monetización ni ventaja comercial.

### Caso comercial

No esta autorizado por defecto.

Si existe interes en ese uso, debe evaluarse una autorización escrita o una licencia comercial separada.

## Referencias oficiales

- `LICENSE`
- `NOTICE`
- `AUTHORS`
- `ATTRIBUTIONS.md`
- `docs/03-Legal/README.md`
- `docs/03-Legal/RESPUESTAS-LICENCIA.md`
- `docs/03-Legal/LICENSE-RESPONSE-TEMPLATES.en.md`
