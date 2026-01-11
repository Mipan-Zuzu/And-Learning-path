import Label from "../components/Label"
import Title from "../components/Title"
import Button from "../components/Button"
import { useRef, useState} from "react"
import validator from 'validator';
import { Link } from "react-router-dom";

const RegisterPage = () => {

    const inputEmail =  useRef(null)
    const inputPassword = useRef(null)
    
    const [emailCheck, setEmailCheck] = useState()
    const [passwordCheck, setPasswordCheck] = useState()

    const sesionLogin = () => {

        setEmailCheck(null)
        setPasswordCheck(null)
        
        
        const Email = inputEmail.current.value
        const Password = inputPassword.current.value
        
        Password === "" ? setPasswordCheck("password empty") : console.log({message : "password valid"})
        validator.isEmail(Email) === true ? console.log(Email) : setEmailCheck("Email not valid")

        if(Email === "" && Password === ""){
            console.log("Email tidak terdaftar")
            return
        }


        const sendApi = () => {
            fetch(`https://fixed-ant-ands-9cc7ffdd.koyeb.app/result`, {
            method : "POST",
            headers : {"Content-Type": "application/json"},
            body : JSON.stringify({ Email: Email ,Password : Password})
        }).then((res) => res.json())
        .catch((err) => console.error(err))
        }


        if(validator.isEmail(Email) === true && Password !== "") {
            console.log({message : "login berhasil terkirim"})
            sendApi()
            window.location.href = "/"
        }
    }


    return (
        <>
            <form className="min-h-screen flex flex-col justify-center items-center">
                <Title size={"text-2xl font-medium"}>Sign up</Title>
                <p className="text-red-500">{emailCheck} <br />{passwordCheck}</p>
                <div className="mb-2">
                    <Title >Email</Title>
                    <Label type="email" 
                    ref={inputEmail}
                    placeholder="Example@mail.com">Email</Label>
                </div>
                <div className="mb-2">
                    <Title>password</Title>
                    <Label type="password" 
                    ref={inputPassword}
                    placeholder="password">password</Label>
                </div>
                <Button type="button" size={"p-2 border w-64"} onClick={sesionLogin}>Login</Button>
                  <div className="mb-2">  
        <h2>have an account <Link className="text-blue-500 border-b border-blue-500" to="/">login</Link></h2>
      </div>
            </form>
        </>
    )
}


export default RegisterPage