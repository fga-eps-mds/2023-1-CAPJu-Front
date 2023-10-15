import jwtDecode from "jwt-decode";

export const getUserInfo = (): User => {
    const jwtToken = localStorage.getItem("@CAPJu:jwt_user");
    if(!jwtToken) return {} as User;
    // @ts-ignore
    return jwtDecode(JSON.stringify(jwtToken)).id as User
}