import { Grid, GridItem } from "@chakra-ui/react"
import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";

// Este componente es para 
const Auth = () =>{
    return(
        <>
            <h1>Componente Auth</h1>
            <Grid style={styles.Grid}>{/**templateColumns='repeat(3,500px)' gap={70} placeContent={"center"} */}
                <GridItem>
                    <LoginForm/>
                </GridItem>
            </Grid>
        </>
    )
}

const styles = {
    Grid: {
        margin: "10",
        border: "1px solid black",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center"
    }
};


export default Auth;