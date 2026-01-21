<template>
    <header class="header">
        <div class="navbar">
            <div class="logo">
                <img src="../assets/img/logo.png" alt="Logo carnicería">
                <div class="descr">
                    <h1>Carnicería</h1>
                    <span>Gestión de Pedidos</span>
                </div>
            </div>
            <nav class="menu">
                <ul>
                    <li>
                        <RouterLink to="/">Panel de Gestión</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/pedidos">Pedidos</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/formulario">Nuevo Pedido</RouterLink>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
</template>
<script setup></script>
<style scoped>
/* Contenedor principal como flex vertical */
.header {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
}

.navbar {
    width: 100%;
    height: auto;
    padding: 0;
    z-index: 1000;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    background: rgba(248, 248, 248, 0.7);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4.9px);
    -webkit-backdrop-filter: blur(4.9px);
    border: 1px solid rgba(248, 248, 248, 0.13);
}

.menu ul {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 1.5rem;
    padding: 0;
    margin: 0;
}

li {
    list-style: none;
}

a {
    text-decoration: none;
    color: var(--color-bg);
    font-family: var(--font-titles);
    font-weight: 600;
    font-size: 1.5rem;
    letter-spacing: .15rem;
    padding: .7rem .9rem;
    background-color: var(--color-primary);
    border-radius: 15px;
}

.logo {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    column-gap: .7rem;
    padding: .5rem;
    width: 30%;
    height: auto;
}

.descr {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

h1 {
    font-family: var(--font-titles);
    font-weight: 600;
    font-size: 2rem;
    letter-spacing: .15rem;
    margin: 0;
}

span {
    font-family: var(--font-text);
    font-weight: 600;
}

img {
    width: 22%;
}
</style>