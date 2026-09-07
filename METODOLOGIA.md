# Metodología de Desarrollo - Dashboard Tópico Escolar

Basado en documento de referencia proporcionado

---

## 📋 Fases del Proyecto

### 1. ✅ Análisis de Proceso Actual
- Revisión del flujo actual en el colegio
- Identificación de roles:
  - **Lic. María García** - Enfermera Escolar
  - Asistenta de salud
  - Dirección
- Documentación de necesidades reales vs. prototipo actual

**Hallazgos:**
- Necesidad de separar nombre y apellido
- Registro de nivel educativo (inicial/primaria/secundaria)
- Diagnóstico diferenciado del motivo
- Seguimiento de medicación con receta
- Control de contacto con padres
- Reporte de incidencias y recurrencia

---

### 2. ✅ Definir Requerimientos

#### **Funcionales:**
- ✅ Registro completo de atención (estudiante, motivo, diagnóstico, tratamiento)
- ✅ Contacto con padres + autorización
- ✅ Medicación con validación de receta (especial: Ampolla requiere receta)
- ✅ Historial con filtros (nombre, grado, estado, fecha)
- ✅ Reportes (motivos frecuentes, estado, incidencias, recurrencia)
- ✅ Vista de estudiantes con badge de recurrencia
- ✅ Detalle de atención con información completa

#### **No Funcionales:**
- 🔄 Seguridad (autenticación, roles - PENDIENTE)
- 🔄 Rendimiento (base de datos - PENDIENTE)
- 🔄 Disponibilidad (acceso offline/online - PENDIENTE)
- 🔄 Cumplimiento normativo (RGPD/datos sensibles - PENDIENTE)

---

### 3. 🔄 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│              FLUJO PRINCIPAL DE ATENCIÓN                    │
└─────────────────────────────────────────────────────────────┘

INICIO
  │
  ├─→ Estudiante llega al Tópico
  │
  ├─→ REGISTRO DE ATENCIÓN
  │   • Nombre (separado: nombre + apellido)
  │   • Grado, Sección, Nivel educativo
  │   • Fecha y hora
  │
  ├─→ INFORMACIÓN CLÍNICA
  │   • Motivo de consulta
  │   • Diagnóstico
  │   • Síntomas
  │   • Signos vitales (T°, FC, PA)
  │   • IMC
  │
  ├─→ MEDICACIÓN
  │   • ¿Ampolla? ──→ ¿Tiene receta? (VALIDACIÓN)
  │   • Otro medicamento
  │   • Tratamiento
  │
  ├─→ CONTACTO PADRES
  │   • ¿Contactar? SÍ / NO
  │   │
  │   └─→ Hora de llamada
  │       └─→ ¿Autorización? SÍ / NO
  │           └─→ Hora de autorización
  │
  ├─→ ESTADO FINAL
  │   • ATENDIDO (completado)
  │   • PENDIENTE (requiere seguimiento)
  │   • DERIVADO (centro de salud)
  │
  └─→ FIN

REPORTES GENERADOS:
  • Motivos frecuentes (gráfico)
  • Recurrencia por estudiante (alertas)
  • Incidencias (traumatismos, accidentes)
  • Estado de atenciones (porcentajes)
```

---

### 4. ✅ Prototipo de Alta Fidelidad (Figma)

**Ya implementado en React:**

#### Componentes principales:
- **Dashboard**: KPIs (atenciones hoy, estudiantes únicos, pendientes, derivaciones)
- **Registro**: Formulario completo con validaciones
- **Historial**: Tabla filtrable con búsqueda
- **Estudiantes**: Vista con cards de recurrencia
- **Reportes**: Gráficos y tablas de análisis
- **Detalle**: Vista completa de cada atención
- **Configuración**: Datos de institución y personal

#### Diseño visual:
- Paleta: Azul (principal), Esmeralda (éxito), Naranja (advertencia), Rojo (urgencia)
- Tipografía: Outfit (títulos), Inter (cuerpo)
- Componentes: Cards, Badges, Botones, Inputs con validación

---

### 5. 🚀 Diseñar Base de Datos (DER Físico)

**Estructura recomendada:**

```sql
-- TABLA: Students
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  educationLevel ENUM('inicial', 'primaria', 'secundaria') NOT NULL,
  gradeId INT,
  sectionId INT,
  enrollmentDate DATE,
  parentName VARCHAR(200),
  parentPhone VARCHAR(20),
  FOREIGN KEY (gradeId) REFERENCES grades(id),
  FOREIGN KEY (sectionId) REFERENCES sections(id)
);

-- TABLA: Attention (Principal)
CREATE TABLE attention (
  id INT PRIMARY KEY AUTO_INCREMENT,
  studentId INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason VARCHAR(100),
  diagnosis VARCHAR(200),
  symptoms TEXT,
  vitals VARCHAR(200),
  imc DECIMAL(5,2),
  medication VARCHAR(100),
  hasRecipe BOOLEAN DEFAULT FALSE,
  treatment TEXT,
  observations TEXT,
  status ENUM('atendido', 'pendiente', 'derivado') DEFAULT 'atendido',
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  INDEX idx_date (date),
  INDEX idx_student (studentId),
  INDEX idx_status (status)
);

-- TABLA: Parent_Contact (Seguimiento)
CREATE TABLE parent_contact (
  id INT PRIMARY KEY AUTO_INCREMENT,
  attentionId INT NOT NULL,
  contacted BOOLEAN DEFAULT FALSE,
  callTime TIME,
  authorization BOOLEAN,
  authorizationTime TIME,
  notes TEXT,
  FOREIGN KEY (attentionId) REFERENCES attention(id)
);

-- TABLA: Medications
CREATE TABLE medications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  requiresRecipe BOOLEAN,
  description TEXT
);

-- TABLA: Users (Control de acceso)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  role ENUM('enfermera', 'asistenta', 'dirección'),
  password_hash VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: Grades
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(10) -- "1°", "2°", etc.
);

-- TABLA: Sections
CREATE TABLE sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(5) -- "A", "B", "C", "D"
);
```

---

### 6. 📚 Diccionario de Datos (PAC)

| Campo | Tabla | Tipo | Descripción | Validación |
|-------|-------|------|-------------|-----------|
| firstName | students | VARCHAR(100) | Nombre del estudiante | Requerido, no vacío |
| lastName | students | VARCHAR(100) | Apellido del estudiante | Requerido, no vacío |
| educationLevel | students | ENUM | Nivel: inicial/primaria/secundaria | Requerido |
| diagnosis | attention | VARCHAR(200) | Diagnóstico médico | Requerido, min 3 caracteres |
| imc | attention | DECIMAL(5,2) | Índice de Masa Corporal | Numérico, rango 10-50 |
| medication | attention | VARCHAR(100) | Nombre del medicamento | Si es "Ampolla", hasRecipe debe ser TRUE |
| hasRecipe | attention | BOOLEAN | Medicamento con receta médica | Obligatorio si medication = "Ampolla" |
| status | attention | ENUM | Estado de la atención | 'atendido', 'pendiente', 'derivado' |
| contacted | parent_contact | BOOLEAN | ¿Se contactó al padre? | Booleano |
| authorization | parent_contact | BOOLEAN | ¿Padre autorizó? | Requerido si contacted = TRUE |
| callTime | parent_contact | TIME | Hora de la llamada | HH:MM formato |

---

### 7. 📝 Informe Técnico

#### **Estado del Proyecto:**

**Fase de Desarrollo:** Prototipo Funcional (MVP)

**Stack Tecnológico:**
- **Frontend:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4
- **Estado:** Local (SAMPLE_DATA)
- **Persistencia:** En memoria (sesión)

**Componentes Implementados:**
- ✅ Formulario de Registro (con validación de Ampolla)
- ✅ Tabla de Historial (filtrable)
- ✅ Vista de Estudiantes (con recurrencia)
- ✅ Reportes (motivos, incidencias, estado)
- ✅ Detalle de Atención
- ✅ Dashboard con KPIs

**Mejoras Realizadas:**
- ✅ Separación nombre/apellido
- ✅ Nivel educativo como campo
- ✅ Diagnóstico diferenciado
- ✅ Campo IMC
- ✅ Medicación con validación de receta
- ✅ Flujo mejorado de contacto padres
- ✅ Recurrencia por estudiante (badge rojo si ≥3 visitas/mes)
- ✅ Reporte de incidencias (traumatismos, accidentes, heridas)

**Próximas Fases (Recomendaciones):**

1. **Backend + Base de Datos**
   - Implementar API REST (Node.js, Python, etc.)
   - Migrar a BD SQL (MySQL, PostgreSQL)
   - Autenticación con JWT

2. **Seguridad**
   - Roles (enfermera, asistenta, dirección)
   - Encriptación de datos sensibles
   - RGPD compliance (datos de menores)
   - Logs de auditoría

3. **Integraciones**
   - WhatsApp para notificaciones a padres (Twilio)
   - Exportar PDF de reportes
   - Sincronización con sistema de inscripción

4. **Mejoras UX**
   - Agregar fotos de estudiantes
   - Historial médico (alergias conocidas)
   - Calendario de atenciones
   - Notificaciones en tiempo real

---

## 📊 Métricas de Éxito

- ✅ Sistema registra 100% de atenciones
- ✅ Contacto padres rastreable (fecha + hora + autorización)
- ✅ Reporte incidencias automático
- ✅ Alerta de recurrencia (≥3 visitas/mes)
- ✅ Validación Ampolla + receta 100% funcional

---

## 📞 Contacto y Referencias

**Institución:** IEP Señor de la Vida  
**Responsable:** Lic. María García - Enfermera Escolar  
**Resolución:** RD Nº 02578 - SREP  

**Documento Generado:** 2026-09-03
