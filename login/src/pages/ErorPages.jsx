import { useRouteError  } from "react-router-dom";
const PUB_API = import.meta.env.VITE_API_PUB
const LOC_API = import.meta.env.VITE_API_LOC

const ErrorPages = () => {
    const eror = useRouteError()
    return(
    <>
        <div className="min-h-screen flex justify-center items-center">
            <h1 className="text-4xl">Sory page <span className="text-red-500">{eror.statusText}</span></h1>
        </div>
    </>
    )
}

export default ErrorPages