import React, { FC, useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import '@/Presentation/Style/App.scss';
import { Supplier, User } from '@/Domain/Entity';
import { SupplierRepository, UserRepository } from '@/Domain/Repository';
import { MasterContext } from '@/Presentation/Context';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
interface AppState {
    users: User[];
    suppliers: Supplier[];
}

const App: FC<AppProps> = ({ Component, pageProps }) => {
    const [state, setState] = useState<AppState>({ users: [], suppliers: [] });
    const fetchData = async () => {
        const users = await UserRepository.list();
        const suppliers = await SupplierRepository.list();
        setState({ users, suppliers });
    };
    useEffect(() => {
        fetchData();
    }, []);
    if (!state) return <div>loading</div>;
    return (
        <MasterContext.Provider value={{ ...state }}>
            <Component {...pageProps} />
        </MasterContext.Provider>
    );
};

export default App;
