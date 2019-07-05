
Vue.use(VeeValidate);

app=new Vue({
  el: '#app',
  delimiters: ['[[', ']]'],
  data:{
    
  },
  methods: {
  onSubmit() {
    this.$validator.validate("versity").then(valid => {
      if (!valid) {
        console.log("invalid");
        console.log($("#daw").val())
        // do stuff if not valid.
      }
      else console.log("valid");
      this.$validator.validateAll("univer").then(valid => {
        if (!valid) {
          console.log("22invalid");
          // do stuff if not valid.
        }
        else console.log("22valid");})
        this.$validator.validateAll().then(valid => {
          if (!valid) {
            console.log("allinvalid");
            // do stuff if not valid.
          }
          else console.log("allvalid");})
})}}
})



/* Vue.set(data,'wo', '男'); */


/* var app = new Vue({
  el: '#app',
  data: {
    message: "hello world!"
  },
}) */