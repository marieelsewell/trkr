<template>
      <header class="header">
        <img src="../assets/logo.png" alt="Logo" class="logo" @click="goToDashboard">
        <button class="logout-button" @click="logout">Logout</button>
      </header>
    <div class="dashboard">
  
      
      <div class="dashboard-content">
        <div class="status-list">
          <div class="welcome-text">WELCOME BACK, {{ username }}!</div>
          <p><span class="status-number">{{ applicationCount }}</span> Applications Submitted</p>
          <p><span class="status-number">{{ interviewScheduledCount }}</span> Interviews Scheduled</p>
          <p><span class="status-number">{{ interviewCompletedCount }}</span> Interviews Completed</p>
          <p><span class="status-number">{{ offerPendingCount }}</span> Pending Offers</p>
          <p><span class="status-number">{{ rejectedCount }}</span> Rejections</p>
        </div>
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
          <div class="chart-center-text">{{ applicationCount }}</div>
        </div>
      </div>
      <button class="continue-btn" @click="handleContinue">Continue →</button>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';
  import { useRouter } from 'vue-router'; 
  
  export default {
    name: 'Dashboard',
    setup() {
      const router = useRouter();
      const chartCanvas = ref(null);
      let chartInstance = null;
  
      const username = ref('');
      const applicationCount = ref(0);
      const appliedCount = ref(0);
      const interviewScheduledCount = ref(0);
      const interviewCompletedCount = ref(0);
      const offerPendingCount = ref(0);
      const rejectedCount = ref(0);
  
      const jobData = ref({
        labels: ['Applied', 'Interview Scheduled', 'Interview Completed', 'Offer Pending', 'Rejected'],
        datasets: [{
          data: [0, 0, 0, 0, 0], 
          backgroundColor: [
            '#91D4D4', // Applied
            '#70C2C2', // Interview Scheduled
            '#51B1B1', // Interview Completed
            '#2E9E9E', // Offer Pending
            '#0D8C8C'  // Rejected
          ],
          borderWidth: 0,
          cutout: '15%' 
        }]
      });
  
      const fetchUser = async () => {
        try {
          const response = await fetch("/api/users/session", {
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('Unable to retrieve session');
          }
          const sessionData = await response.json();
          console.log('fetching session data:', sessionData);
          const userId = sessionData.user;
          console.log('fetching user id:', userId);

          const userResponse = await fetch(`/api/users/${userId}`, {
            credentials: 'include'
          });
          if (!userResponse.ok) {
            throw new Error('Unauthorized');
          }
          const userData = await userResponse.json();
          username.value = userData.username;
        } catch (error) {
          console.error("Error fetching user:", error);
        }
    };

  
    const fetchApplicationCount = async () => {
      try {
        const response = await fetch("/api/applications", {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
        const data = await response.json();
        console.log('fetching application data:', data);
        applicationCount.value = data.length;
        appliedCount.value = data.filter(app => app.status === 'Applied').length;
        interviewScheduledCount.value = data.filter(app => app.status === 'Interview Scheduled').length;
        interviewCompletedCount.value = data.filter(app => app.status === 'Interview Completed').length;
        offerPendingCount.value = data.filter(app => app.status === 'Offer Pending').length;
        rejectedCount.value = data.filter(app => app.status === 'Rejected').length;

        // pie chart data
        jobData.value.datasets[0].data = [
          appliedCount.value,
          interviewScheduledCount.value,
          interviewCompletedCount.value,
          offerPendingCount.value,
          rejectedCount.value
        ];
        if (chartInstance) {
          chartInstance.update();
        }
      } catch (error) {
        console.error("Error fetching application count:", error);
      }
    };
  
      const logout = async () => {
        try {
          const response = await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include'
          });
          const data = await response.json();
          if (data.success) {
            //alert('Logout successful!');
            router.push('/login');
          } else {
            //alert('Logout failed: ' + data.message);
          }
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };
  
      const goToDashboard = () => {
        router.push(router.currentRoute.value.path);

        console.log('Navigating to dashboard...');
      };
  
      const handleContinue = () => {
        console.log('Continue clicked!');
        router.push('/applications');
      };
  
      onMounted(async () => {
        await fetchUser();
        await fetchApplicationCount();
  
        const ctx = chartCanvas.value.getContext('2d');
        chartInstance = new Chart(ctx, {
          type: 'pie',
          data: jobData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false 
              },
              title: {
                display: false
              }
            }
          }
        });
      });
  
      watch(() => [appliedCount.value, interviewScheduledCount.value, interviewCompletedCount.value, offerPendingCount.value, rejectedCount.value], () => {
        jobData.value.datasets[0].data = [
          appliedCount.value,
          interviewScheduledCount.value,
          interviewCompletedCount.value,
          offerPendingCount.value,
          rejectedCount.value
        ];
        if (chartInstance) {
          chartInstance.update();
        }
      });
  
      return {
        chartCanvas,
        username,
        applicationCount,
        appliedCount,
        interviewScheduledCount,
        interviewCompletedCount,
        offerPendingCount,
        rejectedCount,
        logout,
        goToDashboard,
        handleContinue
      };
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    background-color: transparent;
    border-radius: 8px;
    width: 90%;
    margin: 0 auto;
    position: relative;
    height: 90%;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
  }
  
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 100px;
    height: auto;
    cursor: pointer;
  }
  
  .logout-button {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 10px;
    background-color: #1C2222;
    color: #D7F4F4;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .logout-button:hover {
    background-color: #D7F4F4;
    color: #1C2222;
  }
  
  .welcome-text {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    text-align: left;
    padding: 20px;
  }
  
  .dashboard-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px;
    margin-top: -100x;
    margin-bottom: 20px;
  }
  
  .status-list {
    white-space: nowrap;
    text-align: right;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .status-list p {
    font-size: 26px;
    color: #333;
    margin: 10px 0;
    padding: 15px;
  }

  .status-number {
    font-size: 32px;
    font-weight: bold;
    color: #333;
  }
  
  .chart-container {
    position: relative;
    width: 700px;
    height: 700px;
  }
  
  canvas {
    width: 100% !important;
    height: 100% !important;
    opacity: 0.7;
  }
  
  .chart-center-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 120px;
    font-weight: bold;
    color: #333;
    z-index: 1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .continue-btn {
    background-color: transparent;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 26px;
    position: absolute;
    bottom: 20px;
    right: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  }
  
  .continue-btn:hover {
    background-color: #90a4ae; 
  }
  
  </style>