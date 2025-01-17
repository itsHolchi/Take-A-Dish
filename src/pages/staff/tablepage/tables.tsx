import { tableData } from "../../../hooks/useTable";
import { useTable } from "../../../hooks/useTable";
import { tableRef } from "../../../config/firebase";
import { adminTable, inactiveTable, syncedTable, tableNotif, unsyncedTable } from "../../../assets/assets";
import { useEffect, useState } from "react";
import { LoadingIcon } from "../../../components/LoadingIcon";
import { onSnapshot, orderBy, query, where } from "firebase/firestore";
import { StaffHandleAssisstanceMdal } from "../../../components/modals/StaffHandleAssisstanceModal";

// import Table
interface TableProps{
    table: tableData;
    handleLoadProp: (loadingState: boolean) => void;
    setShowModal: (modalState: boolean) => void;
    setTableID: (tableID: string) => void;
}

export const Tables = ({table, handleLoadProp, setShowModal, setTableID}: TableProps) => {
    const [tables, setTables] = useState<tableData[] | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const { deleteTable } = useTable();
    const account = localStorage.getItem('accountType');
    useEffect(() => {
        const q = query(tableRef, orderBy("tableNumber"));
        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map((doc) => ({ ...doc.data() }));
            const tablesArr = data.map((data) => data) as tableData[];
            setTables(tablesArr);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async(tableID: string) => {
        try {
            handleLoadProp(true);
            if(table.isSynced){
                setShowModal(true);
            }
            else await deleteTable(tableID);
        } catch(error: unknown) {
            if(error instanceof Error) console.log(error.message);
        } finally {
            handleLoadProp(false);
        }
    };

    const handleRequest = async(tableID: string) => {
        if(!(table.isActive)) {
            alert("not active");
            return;
        }
        setShowModal(true);
        setTableID(tableID);
    };

    useEffect(() => {   
        console.log(`Admin: ${isAdmin}`);
    }, [isAdmin]);
    if(account === 'admin'){
        return (
            <>
                <div className="box-container">
                <div className="table-container">
                    <h3>{table.tableNumber}</h3>
                    {table.isSynced? (
                        <img height='80px' width='120px' src={syncedTable}/>
                    )
                    :
                    (
                        <img height='80px' width='120px' src={unsyncedTable}/>
                    )}

                    <button className="deleteTable" onClick = {() => handleDelete(table.tableID)}>Delete</button>
                </div>
                </div>
            </>
        );
    } else if(table.isOrdering){
        return(
            <>
                <div className="box-container">
                    <div className="table-container">
                        <h3>{table.tableNumber}</h3>
                        {table.isActive? (
                            <>
                                {(table.isRequestingAssistance || table.isRequestingBill)? (table.isRequestingAssistance, 
                                    <img height='80px' width='120px'src={tableNotif} onClick = {() => handleRequest(table.tableID)}/>                                  
                                )
                                :
                                (
                                    <img height='80px' width='120px' src={syncedTable} onClick = {() => {handleRequest(table.tableID)}}/>
                                )}
                            </>
                        )
                        :
                        (
                            <img height='80px' width='120px' src={inactiveTable}/>   
                        )}
                            <span>STATUS:</span>
                            <span style={{color:'yellow'}}>PLACED ORDER</span>
                    </div>
                </div>
            </>
        );
    } else {
        return(
            <>
                <div onClick = {() => handleRequest(table.tableID)} className="box-container">
                    <div className="table-container">
                        <h3>{table.tableNumber}</h3>
                        {table.isActive? (
                            <>
                                {(table.isRequestingAssistance || table.isRequestingBill)? (table.isRequestingAssistance, 
                                    <img height='80px' width='120px'src={tableNotif} />                                  
                                )
                                :
                                (
                                    <img height='80px' width='120px' src={syncedTable}/>
                                )}
                            </>
                        )
                        :
                        (
                            <img height='80px' width='120px' src={inactiveTable}/>   
                        )}
                        {table.isActive? (
                        
                            <>
                            <span>STATUS:</span>
                            <span style={{color: 'green'}}>ACTIVE</span>
                            </>
                            
                        )
                    :
                    (
                        <>
                        <span>STATUS:</span>
                        <span style={{color: 'red'}}>INACTIVE</span>
                        </>
                        
                    )
                    }                       
                    </div>
                </div>
            </>
        );
    }
}