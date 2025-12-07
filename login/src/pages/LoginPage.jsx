import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import Label from "../components/Label";
import Title from "../components/Title";
import { useRef, useState } from "react";
import validator from "validator";

const LoginPage = () => {
  const inputEmail = useRef();
  const inputPassword = useRef();

  const [checkEmail, setCheckEmail] = useState();
  const [checkPassword, setCheckPassword] = useState();
  const [checkVal, setCheckVal] = useState();
  const [checkRes, setCheckRes] = useState();

  const sinkronLogin = () => {
    setCheckEmail(null);
    setCheckPassword(null);
    setCheckVal(null);
    setCheckRes(null);

    const Email = inputEmail.current.value;
    const Password = inputPassword.current.value;
    if (!Email && !Password) {
      setCheckVal("password dan Email harus di isi");
      return;
    }

    const checkLogin = async () => {
      const res = await fetch("https://and-api-ten.vercel.app/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: Email,
          Password: Password,
        }),
      })
      const data = await res.json();
      if (data.login === false) {
        setCheckRes(data.message);
        console.log(data.login)
        return;
      }

      if (data.login === true) {
        console.log(data.login)
        window.location.href = "/home"
      }
    }

    validator.isEmail(Email) === true
      ? console.log({ message: "Email valid" })
      : setCheckEmail("it's dosen't looks like Email");
    Password === ""
      ? setCheckPassword("there is no password")
      : console.log({ message: "password valid" });

    if (validator.isEmail(Email) === true && Password !== "") {
      checkLogin();
      return;
    }
  };

  return (
    <form className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-center text-2xl">Login</h1>
      <p></p>
      <div className="mb-2">
        <Title>Email</Title>
        <Label placeholder="Example@mail.com" ref={inputEmail} type="email">
          Email
        </Label>
      </div>

      <div className="mb-2">
        <Title>Password</Title>
        <Label placeholder="Password" type="text" ref={inputPassword}>
          Password
        </Label>
      </div>
      <Button type="button" size={"p-2 border w-64"} onClick={sinkronLogin}>
        Login
      </Button>
      <h2 className="mt-2 text-center text-red-500">{checkRes}</h2>
      <div className="mt-2 text-center">
        <h1 className="text-red-500">{checkVal}</h1>
      </div>
      <h2 className="text-red-500 mb-2 text-center">
        {checkEmail} <br /> <span>{checkPassword}</span>
      </h2>
    </form>
  );
};

export default LoginPage;
