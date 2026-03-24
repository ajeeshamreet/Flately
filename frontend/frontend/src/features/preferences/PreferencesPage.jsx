import { useDispatch } from "react-redux";
import { apiRequest } from "../../services/api";
import { start , success, fail} from "./preferencesSlice"

import PreferenceForm from "./PreferenceForm";


export default function PreferencesPage() {
    const dispatch= useDispatch();
    async function submit(data){
        try{
            dispatch(start())
            const res = await apiRequest("/preferences/me",{
                method : "POST",
                body : JSON.stringify(data)
            })
            dispatch(success(res))




        }
        catch(error){
            dispatch(fail(error.message))
        }
    }
    return (
        <>
        <h2>Set your preferences</h2>
        <PreferenceForm onSubmit={submit} />
        </>
    )


}