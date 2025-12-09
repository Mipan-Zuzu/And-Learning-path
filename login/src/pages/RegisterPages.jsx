import Label from "../components/Label"
import Title from "../components/Title"
import Button from "../components/Button"
import { useRef, useState} from "react"
import validator from 'validator';

const RegisterPage = () => {

    const inputEmail =  useRef(null)
    const inputPassword = useRef(null)
    
    const [emailCheck, setEmailCheck] = useState()
    const [passwordCheck, setPasswordCheck] = useState()
    const sesionLogin = async () => {
    setEmailCheck(null)
    setPasswordCheck(null)

    const Email = inputEmail.current.value
    const Password = inputPassword.current.value

    if (Password === "") setPasswordCheck("password empty")
    if (!validator.isEmail(Email)) setEmailCheck("Email not valid")
    if (Email === "" && Password === "") return

    const sendApi = async () => {
        try {
            const res = await fetch(`https://and-api-ten.vercel.app/result`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Email, Password }),
            });

            return await res.json();
        } catch (err) {
            console.error(err);
        }
    };

    if (validator.isEmail(Email) && Password !== "") {
        console.log("Kirim data...");
        const result = await sendApi(); 

        if (result?.user) {
            window.location.href = "/login";
        }
    }
};

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
        <h2>have an account <a className="text-blue-500 border-b border-blue-500" href="/login">login</a></h2>
      </div>
            </form>
        </>
    )
}


export default RegisterPage