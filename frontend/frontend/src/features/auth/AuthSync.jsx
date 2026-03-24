import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { setAuth, clearAuth } from "./authSlice";

export default function AuthSync({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("🔄 AuthSync:", {
      isLoading,
      isAuthenticated,
      user: user?.email,
    });
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log("✅ Dispatching setAuth");
        dispatch(setAuth(user));
      } else {
        console.log("❌ Dispatching clearAuth");
        dispatch(clearAuth());
      }
    }
  }, [isAuthenticated, user, isLoading, dispatch]);

  return children;
}

// export default function AuthSync({children}){
//     const { isAuthenticated,user, isLoading} = useAuth0();
//     const dispatch = useDispatch();

//     useEffect(()=>{
//         dispatch(authLoading());

//             if(isAuthenticated && user){
//                 dispatch(setAuth(user));
//             }
//             else if(!isLoading){
//                 dispatch(clearAuth());
//             }

//         },[isAuthenticated,user,isLoading,dispatch]
//     )

//     return children;
// }
