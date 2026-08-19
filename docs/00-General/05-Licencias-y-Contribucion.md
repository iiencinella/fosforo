---
tags:
  - proyecto/fosforo
  - licencia
  - contribucion
  - polyform
  - cc-by-nc
type: guia-licencia
area: general
status: vigente
created: 2026-03-07
updated: 2026-04-05
related:
  - "[[README|Indice de documentación]]"
  - "[[03-Indice-General|Indice General]]"
  - "[[../03-Legal/README|Legal y Licencias]]"
  - "[[../LICENSE|LICENSE]]"
  - "[[../NOTICE|NOTICE]]"
---

# Licencias y Contribucion

> [!info] Código disponible con uso no comercial
> Fósforo permite contribuciones abiertas con reconocimiento de autoria, pero no autoriza uso comercial sin permiso expreso.

> [!note] Terminologia recomendada
> Mientras el codigo siga bajo PolyForm Noncommercial 1.0.0, la descripción publica correcta es `source-available`, comunitario y no comercial. No debe presentarse como Open Source en sentido OSI.

---

## Licencia Principal

### Esquema dual por tipo de material

Este repositorio aplica dos licencias segun el tipo de contenido:

#### 1. Codigo fuente y scripts — PolyForm Noncommercial 1.0.0

- ✅ **Permite** uso personal, educativo, religioso y de investigación
- ✅ **Permite** modificación y distribucion no comercial
- ✅ **Permite** uso por organizaciónes sin fines de lucro, educativas y gubernamentales
- ⚠️ **Prohibe** uso comercial sin autorización escrita del titular
- ⚠️ **Requiere** mantener avisos de licencia y atribucion

#### 2. Contenido textual y multimedia — CC BY-NC 4.0

- ✅ **Permite** compartir y adaptar para fines no comerciales
- ✅ **Requiere** atribucion al autor/original
- ⚠️ **Prohibe** uso comercial sin permiso separado

### Por que este esquema?

1. **Mision pastoral**: la tecnologia es un medio para evangelizar, no un producto comercial
2. **Proteccion del proyecto**: evitar que terceros monetizen sin contribuir a la mision
3. **Apertura controlada**: cualquiera puede colaborar y usar, pero con fines no comerciales
4. **Reconocimiento garantizado**: los contribuidores son reconocidos en `AUTHORS` y el historial de Git
5. **Flexibilidad**: se pueden otorgar licencias comerciales separadas bajo acuerdo

### Que se considera uso comercial?

En terminos generales, cualquier uso orientado a **ventaja comercial o compensación monetaria** (directa o indirecta). Si tienes dudas, abre un issue antes de usar el material.

---

## Como Contribuir

### Tipos de Contribucion

#### 1. Codigo

- Desarrollo de features
- Correccion de bugs
- Optimizaciónes
- Mejoras de UI/UX

#### 2. Documentación

- Mejoras en docs
- Tutoriales
- Traducciones
- Videos explicativos

#### 3. Contenido

- Textos biblicos
- Datos de santos
- Oraciones
- Recursos formativos

#### 4. Diseño

- UI/UX design
- Ilustraciónes
- Animaciónes
- Mockups

#### 5. Testing

- Reportar bugs
- Testing manual
- Tests automatizados
- Feedback de UX

---

## Reconocimiento de Contribuidores

Todos los contribuidores son reconocidos en:

- `AUTHORS` en la raiz del repositorio
- Historial de commits y pull requests
- Notas de releases cuando corresponde
- GitHub contributors graph

### Core Team

Contribuidores frecuentes pueden ser invitados al **Core Team** con:

- Write access al repo
- Voto en decisiones
- Responsabilidades de mantenimiento

---

## Configuración para Contribuidores

### 1. Fork del Repositorio

```bash
# 1. Fork en GitHub
# 2. Clonar tu fork
git clone https://github.com/tu-usuario/fosforo.git
cd fosforo

# 3. Agregar upstream
git remote add upstream https://github.com/iiencinella/fosforo.git
```

### 2. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama para tu feature
git checkout -b feature/nombre-feature
```

### 3. Hacer Cambios

```bash
# Instalar dependencias
pnpm install

# Desarrollar
pnpm dev

# Tests
pnpm test:unit

# Lint
pnpm lint
```

### 4. Commit y Push

```bash
# Commit con mensaje descriptivo
git add .
git commit -m "feat(biblia): agregar búsqueda por versiculo"

# Push a tu fork
git push origin feature/nombre-feature
```

### 5. Pull Request

1. Ve a GitHub
2. Crea un Pull Request
3. Describe tus cambios
4. Espera review

---

## Convenciones de Commit

Usamos **Conventional Commits**:

```
tipo(scope): descripcion

[cuerpo opcional]

[footer opcional]
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Cambios en documentación
- `style`: Formateo, semicolons, etc.
- `refactor`: Refactorización de codigo
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(biblia): agregar búsqueda por versiculo
fix(calendario): corregir calculo de Pascua
docs(readme): actualizar instrucciones de setup
style(oraciones): formatear componentes
refactor(api): simplificar endpoint de eventos
test(formación): agregar tests de cursos
chore(deps): actualizar dependencias
```

---

## Guías de Estilo

### TypeScript/JavaScript

- Usar TypeScript
- ESLint + Prettier configurados
- Naming: camelCase para variables, PascalCase para componentes
- Comentarios en espanol

### React

- Functional components
- Hooks para estado
- Props con TypeScript
- Componentes pequenos y reutilizables

### CSS/Tailwind

- Usar TailwindCSS
- Clases utilitarias
- Mobile-first
- Dark mode ready

---

## Code Review

### Proceso

1. **Autor** crea PR
2. **Reviewer** revisa codigo
3. **Feedback** y cambios
4. **Aprobación**
5. **Merge** a main

### Checklist del Reviewer

- [ ] Codigo cumple con guias de estilo
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Sin errores de lint
- [ ] Funcionalidad probada manualmente
- [ ] Performance aceptable
- [ ] Accesibilidad considerada
- [ ] Licencia y atribución verificadas

---

## Comunicación

### Canales

- **GitHub Issues** - Bugs y features
- **GitHub Discussions** - Preguntas y discusiones
- **Discord** - Chat en tiempo real (proximamente)
- **Email** - contacto@fosforo.app

### Etiqueta

- Sé respetuoso
- Comunicate en forma clara
- Aceptar y respetar la diversidad de opiniones
- Lée la documentación antes de preguntar

---

## Code of Conduct

### Nuestro Compromiso

Nos comprometemos a:

- Generar un ambiente acogedor e inclusivo
- Respetar los diferentes puntos de vista
- Aceptar críticas constructivas
- Enfocarnos en lo mejor para la comúnidad

### Comportamientos Esperados

- Empatía y amabilidad
- Comunicación profesional
- Colaboración constructiva
- Respeto a la misión del proyecto

### Comportamientos Inaceptables

- Lenguaje ofensivo
- Acoso o intimidación
- Trolling o spam
- Compartir información privada

---

## Enlaces Relaciónados

- [[03-Indice-General|Guia General]]
- [[../01-Arquitectura/README|Arquitectura]]
- [[../README|Indice de documentación]]
- [[../03-Legal/README|Legal y Licencias]]

---

## Tags

#licencia #contribucion #noncommercial #polyform #cc-by-nc #code-of-conduct #fosforo
