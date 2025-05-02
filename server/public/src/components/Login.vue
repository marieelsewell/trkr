<template>
    <div class="login-container" :class="{ 'form-active': isRegistering || isSigningIn }">
        <img src="../assets/logo.png" alt="Logo" class="logo">
        <img src="../assets/circle.png" alt="Circle" class="circle">
        <div class="login-header">
            <h1 v-if="!isRegistering && !isSigningIn">Organize your Job Search.</h1>
            <h1 v-else class="small-header">Organize your<br>Job Search.</h1>
            <button v-if="!isRegistering && !isSigningIn" @click="showRegisterForm">Sign Up</button>
        </div>
        <div class="login-form">
            <div v-if="!isRegistering && !isSigningIn" class="sign-in-button">
                <button @click="showSignInForm">Sign In</button>
            </div>
            <div v-if="isRegistering">
                <h2>Create an Account.</h2>
                <form @submit.prevent="register">
                    <input type="text" id="username" placeholder="enter username..." v-model="username" :class="{ 'input-error': !username && submitted }">
                    <input type="email" id="email" placeholder="enter email..." v-model="email" :class="{ 'input-error': !email && submitted }">
                    <input type="password" id="password" placeholder="enter password..." v-model="password" :class="{ 'input-error': !password && submitted }">
                    <button id="submitall" type="submit">Register</button>
                </form>
                <button id="toggle-to-sign-in-button" @click="toggleForm">Already have an account? Sign In</button>
            </div>
            <div v-if="isSigningIn">
                <h2>Sign In.</h2>
                <form @submit.prevent="signIn">
                    <input type="email" id="email" placeholder="enter email..." v-model="email" :class="{ 'input-error': !email && submitted }">
                    <input type="password" id="password" placeholder="enter password..." v-model="password" :class="{ 'input-error': !password && submitted }">
                    <button id="submitall" type="submit">Sign In</button>
                </form>
                <button id="toggle-to-register-button" @click="toggleForm">Don't have an account? Register</button>
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
    data() {
        return {
            isRegistering: false,
            isSigningIn: false,
            username: '',
            email: '',
            password: '',
            submitted: false,
            errorMessage: ''
        };
    },
    setup() {
        const router = useRouter();
        return { router };
    },
    methods: {
        showRegisterForm() {
            this.isRegistering = true;
            this.isSigningIn = false;
            this.errorMessage = '';
        },
        showSignInForm() {
            this.isRegistering = false;
            this.isSigningIn = true;
        },
        toggleForm() {
            this.isRegistering = !this.isRegistering;
            this.isSigningIn = !this.isSigningIn;
            this.username = '';
            this.email = '';
            this.password = '';
            this.submitted = false;
            this.errorMessage = '';
        },
        async register() {
            this.submitted = true;
            if (!this.username || !this.email || !this.password) {
                return;
            }
            try {
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.username, email: this.email, password: this.password }),
                    credentials: 'include' 
                });
                const data = await response.json();
                if (data.success) {
                    //alert('Registration successful! Please sign in.');
                    this.toggleForm();
                } else {
                    //alert('Registration failed: ' + data.message);
                    this.errorMessage = data.message;
                }
            } catch (error) {
                console.error('Error registering:', error);
            }
        },
        async signIn() {
            this.submitted = true;
            if (!this.email || !this.password) {
                return;
            }
            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password }),
                    credentials: 'include' 
                });
                const data = await response.json();
                if (data.success) {
                    //alert('Sign in successful!');
                    this.router.push('/dashboard');
                } else {
                    //('Sign in failed: ' + data.message);
                    this.errorMessage = data.message;
                }
            } catch (error) {
                console.error('Error signing in:', error);
            }
        }
    }
};
</script>

<style scoped>
body, .login-container {
    overflow: hidden;
}

/* when the form is active, change the layout */
.login-container.form-active {
    flex-direction: row;
    justify-content: space-between;
    padding-top: 50px; 
}

.logo {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 600px;
    height: auto;
}

.circle {
    position: absolute;
    bottom: -320px;
    right: -150px;
    width: 1000px;
    height: auto;
    z-index: -1;
}

/* "organize your search" header when the page loads */
.login-header {
    text-align: center;
    padding-top: 275px;
    transition: all 0.5s ease;
}

/* "organize your search" text when the page loads */ 
.login-header h1 {
    font-size: 5em;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* "organize your search" text after button clicked */
.login-header h1.small-header {
    font-size: 4.5em;
    padding-right: 60%;
}

/* Sign Up button when the page loads */
.login-header button {
    padding: 10px;
    font-size: 2em;
    background-color: #1C2222;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 11px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.login-header button:hover {
    background-color: #D7F4F4;
    color: #1C2222;
  }

/* forms before button clicked*/
.login-form {
    display: none;
    transition: all 0.5s ease;
}

/* formms after button clicked */
.login-container.form-active .login-form {
    display: flex;
    position: absolute;
    right: 175px;
    top: 200px;
}

/* form styling */
.login-form div {
    width: 350px;
    padding: 25px;
}

/* form header */
.login-form h2 {
    text-align: center;
    font-size: 2.5em;
    font-weight: lighter;
}

/* form elements */
.login-form form {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 8px;
}

/* input boxes */
.login-form input {
    margin-bottom: 10px;
    padding: 13px;
    border: 1px solid #D7F4F4;
    border-radius: 11px;
    background-color: #D7F4F4;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    margin-bottom: 15px;
}

/* input error styling */
.login-container.form-active input.input-error {
    border: 2px solid red;
}

.error-message {
    color: red;
    margin-top: 10px;
    text-align: center; 
    width: 100%; 
    display: flex;
    justify-content: center; 
}

/* submit buttons */
#submitall {
    padding: 8px;
    font-size: 1em;
    background-color: #1C2222;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 11px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

#submitall:hover {
    background-color: #D7F4F4;
    color: #1C2222;
}

#toggle-to-sign-in-button, #toggle-to-register-button {
    font-size: 1em;
    background-color: transparent; 
    color: #1C2222;
    border: none;
    cursor: pointer;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    padding-left: 18%;
}

</style>