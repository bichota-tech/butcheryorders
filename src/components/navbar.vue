<template>
    <header class="header">
        <div class="navbar">
            <div class="logo">
                <img src="../assets/img/Carniceria logo.png" alt="Logo carnicería">
            </div>
            <nav class="menu">
                <ul>
                    <li>
                        <RouterLink to="/">DASHBOARD</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/pedidos">PEDIDOS</RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/formulario">NUEVO PEDIDO</RouterLink>
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
.navbar{
    width: 100%;
    height: 15rem;
    margin: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    background-image:url(../assets/img/banner.png);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
.menu ul{
    width: 100%;
    height: auto;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 1.5rem; 
    border-radius: 50px;
    background-color: #202020;
}

li{
    list-style: none;
}

a{
    text-decoration: none;
    color: var(--color-bg);
    font-weight: 600;
    font-size: 1.5rem;
}
.logo{
    padding: .5rem;
    width: 30%;
    height: auto;
}

img{
    width: 30%;
    border-radius: 50%;
    border: solid 1px gray;
}




</style>