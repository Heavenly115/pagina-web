# Portafolio Interactivo 3D | Aether115

Bienvenido al repositorio de mi portafolio web personal. Este proyecto es una muestra de mis habilidades combinando **Desarrollo Web** y **Diseño/Modelado 3D** para crear una experiencia inmersiva y moderna.

![Isometric Room Render](assets/room_render.png)

## 🌌 Sobre el Proyecto

Este portafolio no es solo una página estática; cuenta con una escena 3D interactiva en tiempo real construida directamente en el navegador. El diseño sigue una estética **Cyberpunk / Neon Morado y Negro**, ofreciendo un alto contraste y elementos visuales con efecto de cristal (glassmorphism) e iluminación física realista.

### ✨ Características Principales
- **Escena 3D Dinámica**: El encabezado de la página carga un modelo 3D GLTF de un setup de programación isométrico.
- **Iluminación Realista**: Las pantallas (monitor y TV) tienen texturas auto-iluminadas para mostrar imágenes nítidas, y la escena utiliza decaimiento físico de luz (quadratic decay) para un ambiente neón auténtico.
- **Tone Mapping Cinematográfico**: Utiliza *ACESFilmicToneMapping* para simular una cámara del mundo real, mejorando la saturación y los tonos morados sin "lavar" los colores.
- **Tema Neón**: Interfaz de usuario construida desde cero en CSS puro con variables dinámicas, `radial-gradients` puros y sombras (`box-shadow`) de alto contraste.
- **Diseño Responsivo**: Se adapta a teléfonos móviles y pantallas grandes perfectamente, auto-ajustando la cámara 3D para enmarcar el cuarto sin importar la resolución.

## 💻 Tecnologías Utilizadas

- **Three.js**: Biblioteca principal para la importación del modelo `.glb`, renderizado WebGL, y manipulación de nodos de iluminación y materiales.
- **Blender**: Utilizado para modelar el setup (cama, chasis, mesa, tele, monitor, pelota, mouse, florero de tulipanes y un teclado en inglés) y exportarlo al formato optimizado GLTF.
- **HTML5 & CSS3**: Maquetación y sistema de diseño sin frameworks pesados, garantizando máxima velocidad.
- **JavaScript (ES6+)**: Lógica del sitio, importaciones de módulos dinámicos y controles de la cámara orbital.

## 🛠️ Objetos del Setup 3D

La escena principal muestra un cuarto de programador que contiene:
1. Cama
2. Chasis
3. Mesa
4. Tele
5. Monitor
6. Pelota
7. Mouse
8. Florero de tulipanes
9. Teclado en inglés

## 🌐 Enlaces

- **Perfil de GitHub**: [Aether115 / Heavenly115](https://github.com/Heavenly115)
- **Desarrollado por**: Angel Iram Torres Salazar

---
*Diseñado con pasión, código y Three.js.*
