import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createReduxStore, type RootState } from '../config/store';

interface StoreProviderProps {
    children?: ReactNode,
    initialState?: Partial<RootState>,
}

const StoreProvider = (props:StoreProviderProps) => {
    const { children, initialState } = props;

    const store = createReduxStore(
        initialState,
    );
    return (
        <Provider store={store}>
            {children}
        </Provider>

    );
};
export default StoreProvider;
