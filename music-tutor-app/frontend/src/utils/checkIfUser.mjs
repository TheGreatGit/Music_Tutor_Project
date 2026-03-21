import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const checkIfUser = ()=>{
    return useContext(UserContext);
}
export default checkIfUser;