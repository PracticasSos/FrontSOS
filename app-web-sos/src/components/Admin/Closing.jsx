import React, { useState } from "react";
import { Box, Button, Heading } from "@chakra-ui/react";
import PatientRecords from "./PatientRecords";
import { Outlet } from "react-router-dom";

const Closing = () => {
    const [selectedBranch, setSelectedBranch] = useState(null);

    const handleBranchSelection = (branch) => {
        setSelectedBranch(branch);
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
            <Heading mb={4}>Cierre Diario</Heading>
            <Box display="flex" gap={4}>
                <Button 
                    colorScheme="teal" 
                    onClick={() => handleBranchSelection("VEOPTICS")}
                >
                    Cierre Diario VEOPTICS
                </Button>
                <Button 
                    colorScheme="blue" 
                    onClick={() => handleBranchSelection("SOS")}
                >
                    Cierre Diario SOS
                </Button>
            </Box>
            <Box mt={8} width="100%">
                {selectedBranch ? (
                    <PatientRecords branch={selectedBranch} />
                ) : (
                    <Heading size="md" textAlign="center" mt={6} color="gray.500">
                        Por favor, seleccione una sucursal para ver los datos.
                    </Heading>
                )}
            </Box>
            <Box mt={8}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Closing;
