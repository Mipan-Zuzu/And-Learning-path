import Button from "../components/Button"

export default function Main () {
  const testing = () => {
  fetch("http://localhost:5000/logout", {
    method: "GET",
    credentials: "include" 
  })
  .then(() => {
    window.location.href = "/login"
  });
};


  return (
    <div>
      <h1>ini home</h1>
            <Button type="button" size={"p-2 border w-64"} onClick={testing}>
        logout
      </Button>
    </div>
  );
};

