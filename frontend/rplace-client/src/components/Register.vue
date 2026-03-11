
<!--Généré par ia-->

<template>
  <div>
    <p v-if="successMessage">{{ successMessage }}</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <form @submit.prevent="handleRegister">
      <input v-model="user.username" type="text" placeholder="Nom d'utilisateur" required />
      <input v-model="user.password" type="password" placeholder="Mot de passe" required />
      <button type="submit" :disabled="loading">S'inscrire</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      user: { username: "", password: "" },
      loading: false,
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleRegister() {
      this.loading = true;
      try {
        const response = await axios.post("http://localhost:8080/api/auth/register", this.user);
        this.successMessage = response.data;
        this.user = { username: "", password: "" };
      } catch (error) {
        this.errorMessage = error.response?.data ?? "Erreur de connexion";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
