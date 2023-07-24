const PORT = 3000;

function sayHi(req, res) {
  res.send("Hello world ! :)");
}

app.get('/', sayHi); 

app.listen(PORT, function () {
    console.log(`Server is running on: ${PORT}`);
});