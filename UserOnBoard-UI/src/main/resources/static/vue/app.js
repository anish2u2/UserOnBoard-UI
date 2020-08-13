
Vue.component('vuejs-datepicker', vuejsDatepicker);
Vue.component('register-template' ,{
        component:{
            'vuejs-datepicker':vuejsDatepicker
        },
        template:` <div><div>
        <div v-if="loading">
            Please wait while we are loading data.
        </div>
        <div class="form-group">
            <input type="text" :disabled="disabled" class="form-control"  v-model="emailId" :placeholder="emailPlaceholder" />
            <input type="text" class="form-control"  v-model="userName" :placeholder="userNamePlaceholder"/>
            <input type="password" class="form-control"  v-model="password" :placeholder="passwordPlaceHolder"/>
            <input type="text" @keypress="onlyNumber" maxlength="10"  class="form-control"  v-model="mobileNumber" :placeholder="mobileNumberPlaceHolder" />
            <b>Birth Date:</b> <vuejs-datepicker v-model="birthday"></vuejs-datepicker>
            <div class="td" style="padding:10%;"><button  class="btn btn-secondary" @click="signUp()">{{SignUpTitle}} </button></div>
        </div>
        <div class="has-error" ><b>{{errorMessage}}</b></div></div> 
        </div>`,
    
    props:[],
    created:function(){
        axios.get('http://localhost:8081/preRegistrationData.json', 
        {headers: 
        {'x-registration-token':window.localStorage.getItem('x-registration-token')}})
          .then((response) => {
              if(response.status==200){
                if(response.data.statusCode==200){
                    this.emailId=response.data.emailId;
                    this.hasError=false;
                    this.loading=false;
                    this.showRegistrationPage=true;
                }else{
                    window.localStorage.removeItem('x-registration-token');
                    window.localStorage.removeItem('x-user-role');
                    this.errorMessage=response.data.message;
                    this.hasError=true;
                }
              }
           // console.log(response);
          }, (error) => {
            this.errorMessage=error.data.message;
            this.hasError=true;
          //  console.log(error);
          });
    },
    computed:{
        
    },
    data:function(){
       return { 
        emailPlaceholder: 'Enter your email id',
        userNamePlaceholder: 'Enter your name',
        passwordPlaceHolder: 'Enter your password',
        mobileNumberPlaceHolder: 'Enter your Mobile number',
        birthdayPlaceHolder: 'Select your birthday ',
        SignUpTitle: 'Register',
        showRegistrationPage:false,
        loading:true,
        showRegister:false,
        password:'',
        emailId:'',
        userName:'',
        mobileNumber:'',
        birthday:new Date(1990, 9,  16),
        errorMessage:'',
        hasError:false,
        date: new Date(1990, 9,  16),
        disabled:true
        };
    },
    methods:{
        onlyNumber: function($event) {
            //console.log($event.keyCode); //keyCodes value
            if(this.mobileNumber){

            }
            let keyCode = ($event.keyCode ? $event.keyCode : $event.which);
            if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) { // 46 is dot
               $event.preventDefault();
            }
         },
       signUp:function(){

            axios.post('http://localhost:8081/register.json', 
            {userName: this.userName, password: this.password,
                emailId:this.emailId,birthday:this.birthday,mobileNumber:this.mobileNumber},
            {headers: { 'x-registration-token':window.localStorage.getItem('x-registration-token')}})
              .then((response) => {
                  if(response.status==200){
                    if(response.data.statusCode==200){
                        window.localStorage.setItem('x-user-onboard-token',response.data.token);
                        this.errorMessage='Registration successful';
                        this.hasError=false;
                        this.$emit('show-options');
                        window.localStorage.removeItem('x-registration-token');
                        setInterval(this.callAuth, 60000);
                    }else{
                        if(response.data.fieldErrors!=undefined){
                            this.errorMessage=response.data.fieldErrors[0].message;
                        }else{
                        this.errorMessage=response.data.message;
                        this.hasError=true;
                        }
                    }
                  }
               // console.log(response);
              }, (error) => {
                this.errorMessage=error.data.message;
                this.hasError=true;
                //console.log(error);
              });
        },callAuth: function(){
            var timeout=setTimeout(this.authToken, 10000);
            //clearTimeout(timeout);
        },authToken: function(){
            axios.get('http://localhost:8082/isActive.json', 
                    { headers: { 'x-user-onboard-token':window.localStorage.getItem('x-user-onboard-token')}})
                .then((response) => {
                    if(response.status==200){
                        if(response.data.active==true || response.data.active=='true'){
                            //setInterval(this.authToken(), 60000);
                        }else {
                        window.localStorage.removeItem('x-user-onboard-token');
                        window.localStorage.removeItem('x-registration-token');
                        window.localStorage.removeItem('x-user-role');
                        window.location.reload(true);
                        this.hasError=false;
                        //this.$emit('show-options');
                    }
                }
                //console.log(response);
                }, (error) => {
                    window.localStorage.removeItem('x-user-role');
                    window.localStorage.removeItem('x-user-onboard-token');
                        window.localStorage.removeItem('x-registration-token');
                        window.location.reload(true);
               // console.log(error);
                });
        }
    }
    });

    Vue.component('login-template' ,{
        template:` <div>
            <div class="form-group">
            <input type="text" class="form-control"  v-model="emailId" :placeholder="emailPlaceHolder" />
            <input type="password" class="form-control"  v-model="password" :placeholder="passwordPlaceHolder"/>

            <div class="table">
                <div class="row">
                    <div class="td" style="padding:10%;"><button  class="btn btn-secondary" v-on:keyup="clearError()" @click="loginRequest()">{{loginTitle}} </button></div>
                </div>
            </div>
        </div>
        <div class="has-error" v-show="hasError">{{errorMessage}}</div></div>`,
    
    props:[],
    created:function(){

    },
    computed:{
        
    },
    data:function(){
       return { 
        loginTitle: 'Login',
        passwordPlaceHolder: 'Enter your password',
        password:'',
        emailId:'',
        emailPlaceHolder:'Please enter you email',
        errorMessage:'',
        hasError:false
        };
    },
    methods:{
        register: function(){
            this.hasError=false;
            this.showLogin=false;
            this.isHomeRequest=false;this.showRegister=true;
        },loginRequest:function(){
            
            axios.post('http://localhost:8082/authenticate.json', {userName: this.emailId, password: this.password
              })
              .then((response) => {
                  if(response.status==200){
                    if(response.data.statusCode==200){
                        window.localStorage.setItem('x-user-onboard-token',response.data.token);
                        window.localStorage.setItem('x-user-role',response.data.role);
                        this.hasError=false;
                        this.$emit('show-options');
                        var interval=setInterval(this.callAuth, 20000);
                        //clearInterval(interval);
                    }else{
                        this.errorMessage=response.data.message;
                        this.hasError=true;
                    }
                  }
                //console.log(response);
              }, (error) => {
                //console.log(error);
              });
        },
        callAuth: function(){
            var timeout=setTimeout(this.authToken, 10000);
            //clearTimeout(timeout);
        },
        clearError: function(){
            this.hasError=false;
            this.errorMessage='';
        },authToken: function(){
            axios.get('http://localhost:8082/isActive.json', 
                    { headers: { 'x-user-onboard-token':window.localStorage.getItem('x-user-onboard-token')}})
                .then((response) => {
                    if(response.status==200){
                        if(response.data.active==true || response.data.active=='true'){
                           //setInterval(this.authToken(), 60000);
                        }else {
                        window.localStorage.removeItem('x-user-onboard-token');
                        window.localStorage.removeItem('x-registration-token');
                        window.localStorage.removeItem('x-user-role');
                        window.location.reload(true);
                        this.hasError=false;
                        //this.$emit('show-options');
                    }
                }
               // console.log(response);
                }, (error) => {
                    window.localStorage.removeItem('x-user-role');
                    window.localStorage.removeItem('x-user-onboard-token');
                        window.localStorage.removeItem('x-registration-token');
                        window.location.reload(true);
               // console.log(error);
                });
        }
    }
    });

    Vue.component('logout-component',{
        props:{
            doc:{
                type:Object
            }
        }, data: function () {
            return {
              count: 0
            }
          },
          methods:{
            logout:function(){
                axios.get('http://localhost:8082/logout.json', 
                    { headers: { 'x-user-onboard-token':window.localStorage.getItem('x-user-onboard-token') }})
                .then((response) => {
                    if(response.status==200){
                        window.localStorage.removeItem('x-user-onboard-token');
                        window.localStorage.removeItem('x-registration-token');
                        window.localStorage.removeItem('x-user-role');
                        window.location.href = "http://localhost:8080/home";
                        window.location.reload(true);
                    }
                //console.log(response);
                }, (error) => {
                    window.localStorage.removeItem('x-user-role');
                    window.localStorage.removeItem('x-user-onboard-token');
                    window.localStorage.removeItem('x-registration-token');
                    window.location.reload(true);
                    
                //console.log(error);
                });
            }
          },
        template: '<button class="btn btn-secondary" v-on:click="logout()">Logout</button>'
    });

    Vue.component('create-registration-url-component',{
        props:{
            
        }, data: function () {
            return {
                emailId: '',
                emailPlaceHolder:'Please enter user email Id to send them link.',
                errorMessage:''
            }
          },
          methods:{
            sendRegistrationLink:function(){
                axios.get('http://localhost:8081/sendRegistrationMail.json?emailId='+this.emailId, 
                    { headers: { 'x-user-onboard-token':window.localStorage.getItem('x-user-onboard-token') }})
                .then((response) => {
                    if(response.status==200){
                    if(response.data.statusCode==200){
                        this.errorMessage=response.data.message;
                        this.hasError=false;
                    }else{
                        this.errorMessage=response.data.message;
                        this.hasError=true;
                    }
                    }
                //console.log(response);
                }, (error) => {
                   // window.location.href = "http://service.registry.com:8080/home";
               // console.log(error);
                });
            }
          },
        template: '<div><table><tr><td><input type="text" class="form-control"  v-model="emailId" :placeholder="emailPlaceHolder"/></td><td><button  class="btn btn-secondary" v-on:click="sendRegistrationLink()">Generate Link</button></td></tr></table></br>{{errorMessage}}</div>'
    });

    Vue.component('registered-users-component',{
        props:['userName','registrationDate']
        , created:function(){
            console.log(window.localStorage.getItem('x-user-onboard-token'));
            axios.get('http://localhost:8081/listSucessfulRegisteredusers.json', 
                    { headers: { 'x-user-onboard-token':window.localStorage.getItem('x-user-onboard-token') }})
                .then((response) => {
                    if(response.status==200){
                    if(response.data.statusCode==200){
                        this.userList=response.data.userList;
                        this.hasError=false;
                    }else{
                        this.errorMessage=response.data.message;
                        this.hasError=true;
                    }
                    }
                //console.log(response);
                }, (error) => {
                   // window.location.href = "http://service.registry.com:8080/home";
                //console.log(error);
                });
        }, data: function () {
            return {
                userList:[],
                errorMessage:''
            }
          },
          methods:{
            
          },
        template: '<div><table><tr><td>User </td><td>Registration Status</td><td> Registration link active status</td><td>Session</td></tr><tr v-for="user in userList"><td> {{user.emailId}} </td><td>{{user.status}}</td><td>{{user.active}}</td>  <td>{{user.sessionId}}</td></tr></table></br>{{errorMessage}}</div>'
    });

    Vue.component('active-users-component',{
        props:['activeUserName','sessionId']
        , created:function(){
            axios.get('http://localhost:8082/listOfActiveUsers.json', 
                    { headers: { 'x-user-onboard-token':window.localStorage.getItem('x-user-onboard-token') }})
                .then((response) => {
                    if(response.status==200){
                    if(response.data.statusCode==200){
                        this.userList=response.data.userList;
                        this.hasError=false;
                    }else{
                        this.errorMessage=response.data.message;
                        this.hasError=true;
                    }
                    }
                //console.log(response);
                }, (error) => {
                    
                   // window.location.href = "http://service.registry.com:8080/home";
                //console.log(error);
                });
        }, data: function () {
            return {
                userList:[],
                errorMessage:''
            }
          },
          methods:{
            
          },
        template: '<div><table><tr><td>User</td><td>Session</td></tr><tr v-for="user in userList"> <td>{{user.userName}} </td><td>{{user.token}}</td></tr></table></br>{{errorMessage}}</div>'
    });

    var documentManagerApp = new Vue({
        el: '#docApp',
        components:{
            
        },   
        props:[],
        created: function (){
           // console.log('Executing');
            //var queryParam= this.$route!==undefined?this.$route.query.regToken:undefined;
            const params = new URLSearchParams(window.location.search)

           if(params.has('x-registration-token')){
           // console.log('sending registration request');
             window.localStorage.setItem('x-registration-token',params.get('x-registration-token'));
             this.showRegistrationPage=true;
           }else if(window.localStorage.getItem('x-user-onboard-token')!=undefined && window.localStorage.getItem('x-user-onboard-token')!=null){
           // console.log('validating--');   
            axios.get('http://localhost:8082/validateToken.json', 
                    { headers: { 'x-user-onboard-token':window.localStorage.getItem('x-user-onboard-token')}})
                .then((response) => {
                    if(response.status==200){
                        if(response.data.statusCode==200){
                            this.showContent=true;
                            this.isAdmin=response.data.role==1?true:false;
                            if(window.localStorage.getItem('x-user-role')==1){
                                this.isAdmin=true;
                            }
                            this.logoutEnabled=true;
                        }else {
                        window.localStorage.removeItem('x-user-onboard-token');
                        window.localStorage.removeItem('x-registration-token');
                        window.localStorage.removeItem('x-user-role');
                        window.location.reload(true);
                        this.hasError=false;
                        //this.$emit('show-options');
                    }
                }
                //console.log(response);
                }, (error) => {
                    window.localStorage.removeItem('x-user-onboard-token');
                    window.localStorage.removeItem('x-registration-token');
                    window.localStorage.removeItem('x-user-role');
                    window.location.reload(true);
                        window.location.reload(true);
               // console.log(error);
                });
           }else{
               //console.log('showing login page');
            this.showLoginPage=true;
           }
            this.isDataInitialized=true;
        },
        data:{
            isDataInitialized:false,
            showContent:false,
            showLoginPage:false,
            showRegistrationPage:false,
            isAdmin:false,
            isCreateRegLink:false,
            showRegisteredUserComponent:false,
            showActiveUserComponent:false,
            errorMessage:'',
            logoutEnabled:false
        },
        methods:{
            showCreateRegLink: function(){
                this.isCreateRegLink=true;
                this.showRegisteredUserComponent=false;
                this.showActiveUserComponent=false;
            },
            showRegisteredUsers: function(){
               
                this.isCreateRegLink=false;
                this.showRegisteredUserComponent=true;
                this.showActiveUserComponent=false;
               
               
            },
            showActiveUsersSession: function(){
                
                this.isCreateRegLink=false;
                this.showRegisteredUserComponent=false;
                this.showActiveUserComponent=true;
            },
            updateDocsRows : function(doc){
                this.docs.push(JSON.parse(JSON.stringify(doc)));
            },
            hideRegistration: function(){
              //  console.log('hitting');
                this.showRegistrationPage=false;
                this.showContent=true;
                this.showLoginPage=false;
                this.logoutEnabled=true;
            },
            hideLogin: function(){
              //  console.log('hitting---');
                this.showRegistrationPage=false;
                this.showContent=true;
                this.showLoginPage=false;
                this.logoutEnabled=true;
                this.isAdmin=true;
            }
        },
       computed: {
           
       }
    })

    function myAccFunc() {
        var x = document.getElementById("demoAcc");
        if (x.className.indexOf("w3-show") == -1) {
          x.className += " w3-show";
        } else {
          x.className = x.className.replace(" w3-show", "");
        }
      }
      
    
      
      
      function w3_open() {
        document.getElementById("mySidebar").style.display = "block";
        document.getElementById("myOverlay").style.display = "block";
      }
       
      function w3_close() {
        document.getElementById("mySidebar").style.display = "none";
        document.getElementById("myOverlay").style.display = "none";
      }