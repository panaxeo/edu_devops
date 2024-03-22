<script setup lang="ts">
import { ref } from 'vue';
import HelloWorld from '../components/HelloWorld.vue'
import axios from 'axios'

const greetingMsg = ref("Welcome from vue!")

async function getGreeting() {
  axios.get('/backend').then(response => {
    greetingMsg.value = response.data
  }).catch(error => {
    console.error(error)
  });
}
</script>

<template>
  <div class="home">
    <HelloWorld :msg="greetingMsg"/>
    <button @click="getGreeting">Get greeting message from server</button>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .home {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>