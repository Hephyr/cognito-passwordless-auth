import { Button, Flex, Text, TextField } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Auth } from "aws-amplify";
import { useEffect, useReducer } from "react";
import "./App.css";

var generatePassword = (
  length = 20,
  wishlist = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$"
) =>
  Array.from(window.crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => wishlist[x % wishlist.length])
    .join("");

interface state {
  user: any;
  email: string;
  code: string;
  formType: "login" | "signup" | "verifyCode" | "signedIn" | "confirmSignUp";
}

const initialState = {
  user: null,
  email: "",
  code: "",
  formType: "login",
};

const reducer = (state: state, action) => {
  switch (action.type) {
    case "user":
      return { ...state, user: action.payload };
    case "formType":
      return { ...state, formType: action.payload };
    case "email":
      return { ...state, email: action.payload };
    case "code":
      return { ...state, code: action.payload };
    default:
      throw new Error("not a valid action type");
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const checkUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();

      dispatch({ type: "user", payload: user });
      dispatch({ type: "formType", payload: "signedIn" });
    } catch (e) {
      // no user action
      console.log(e);

      dispatch({ type: "formType", payload: "login" });
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const signIn = async () => {
    try {
      const temp = await Auth.signIn(state.email);

      dispatch({ type: "user", payload: temp });
      dispatch({ type: "formType", payload: "verifyCode" });
    } catch (error) {
      if (error.message.includes("User does not exist")) {
        dispatch({ type: "formType", payload: "signup" });
      }

      if (error.message.includes("is not verified")) {
        dispatch({ type: "formType", payload: "confirmSignUp" });
      }
    }
  };

  const signUp = async () => {
    try {
      // generate a random password, will not use, can be changed by other more secure method
      await Auth.signUp({
        username: state.email,
        password: generatePassword(),
      });
      dispatch({ type: "formType", payload: "confirmSignUp" });
    } catch (error) {
      console.log(error);
    }
  };

  const confirmSignUp = async () => {
    try {
      await Auth.confirmSignUp(state.email, state.code);
      dispatch({ type: "formType", payload: "signedIn" });
    } catch (error) {
      console.log(error);
    }
  };

  const verifyCode = async () => {
    try {
      await Auth.sendCustomChallengeAnswer(state.user, state.code);
      await Auth.currentSession();
      dispatch({ type: "formType", payload: "signedIn" });
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      await Auth.signOut();
      dispatch({ type: "formType", payload: "login" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      {state.formType === "login" && (
        <Flex
          justifyContent="center"
          style={{ padding: "4rem", border: "1px solid #aaa" }}
        >
          <Flex as="form" direction="column" width="20em">
            <TextField
              name="email"
              label="Email"
              type="email"
              isRequired={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch({ type: "email", payload: e.target.value })
              }
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                signIn();
              }}
              type="submit"
            >
              Log in
            </Button>
          </Flex>
        </Flex>
      )}
      {state.formType === "signup" && (
        <Flex
          justifyContent="center"
          style={{ padding: "4rem", border: "1px solid #aaa" }}
        >
          <Flex as="form" direction="column" width="20em">
            <TextField
              name="email"
              label="Email"
              type="email"
              isRequired={true}
              value={state.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch({ type: "email", payload: e.target.value })
              }
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                signUp();
              }}
              type="submit"
            >
              Sign up
            </Button>
          </Flex>
        </Flex>
      )}
      {state.formType === "confirmSignUp" && (
        <Flex
          justifyContent="center"
          style={{ padding: "4rem", border: "1px solid #aaa" }}
        >
          <Flex as="form" direction="column" width="20em">
            <TextField
              name="code"
              label="Code"
              type="text"
              isRequired={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch({ type: "code", payload: e.target.value })
              }
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                confirmSignUp();
              }}
              type="submit"
            >
              Confirm Sign up
            </Button>
          </Flex>
        </Flex>
      )}
      {state.formType === "verifyCode" && (
        <Flex justifyContent="center">
          <Flex as="form" direction="column" width="20em">
            <TextField
              name="code"
              label="Code"
              type="text"
              isRequired={true}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch({ type: "code", payload: e.target.value })
              }
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                verifyCode();
              }}
              type="submit"
            >
              Submit code
            </Button>
          </Flex>
        </Flex>
      )}
      {state.formType === "signedIn" && (
        <Flex justifyContent="center">
          <Flex direction="column" width="20em">
            <Text>Hello World</Text>
            <Button
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              type="submit"
            >
              Logout
            </Button>
          </Flex>
        </Flex>
      )}
    </div>
  );
}

export default App;
