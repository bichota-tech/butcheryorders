
<template>
    <header>
        <div class="logo">
            <img src="" alt="Logo carnicería">
        </div>
        <nav class="navbar">
            <ul>
                <li><RouterLink to="/">DASHBOARD</RouterLink></li>
                <li><RouterLink to="/pedidos">PEDIDOS</RouterLink></li>
                <li><RouterLink to="/formulario">NUEVO PEDIDO</RouterLink></li>
            </ul>
        </nav>
    </header>
</template>
<style scoped>
/* Reset mínimo */


/* Contenedor principal como flex vertical */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  padding: 2rem;
  background-color: var(--color-primary);
  z-index: 1000;
}
</style>