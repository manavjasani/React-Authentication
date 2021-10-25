import React, { useState, useEffect, useCallback } from "react";

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {}
});

let logOutTimer;

const calculateRemainingTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    const adjExpireTime = new Date(expirationTime).getTime();

    const remainingTime = adjExpireTime - currentTime;
    return remainingTime;
}

const retrievedToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpirationTime = localStorage.getItem('expirationTime');

    const remainingTime = calculateRemainingTime(storedExpirationTime);
    if (remainingTime < 3600) {
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        return null;
    }

    return {
        token: storedToken,
        expirationTime: remainingTime
    }

}

export const AuthContextProvider = (props) => {
    const tokenData = retrievedToken();
    let initialToken;

    if (tokenData) {
        initialToken = tokenData.token;
    }

    const [token, setToken] = useState(initialToken);

    const userIsLoggedIn = !!token;

    const logoutHandler = useCallback(() => {
        if(logOutTimer) {
            clearTimeout(logOutTimer);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        setToken(null);
    }, []);

    const loginHandler = (token, expirationTime) => {

        localStorage.setItem('token', token);
        setToken(token);

        const remainingTime = calculateRemainingTime(expirationTime);

        logOutTimer = setTimeout(logoutHandler, remainingTime);
    }

    useEffect(() => {
        if (tokenData) {
            logOutTimer = setTimeout(logoutHandler, tokenData.expirationTime);
        }
    }, [tokenData])

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;