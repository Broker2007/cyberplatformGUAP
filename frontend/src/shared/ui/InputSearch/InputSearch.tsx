import { classNames } from 'shared/lib/classNames/classNames';
import SearchIcon from 'shared/assets/icons/search.svg';
import { ChangeEvent } from 'react';
import cls from './InputSearch.module.scss';

interface InputSearchProps {
    className?: string,
    placeholder?: string,
    value?: string,
    onChange?: (value: string) => void,
}

const InputSearch = ({
    className,
    placeholder,
    value,
    onChange,
}: InputSearchProps) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={classNames(cls.InputSearch, {}, [className])}>
            <SearchIcon className={cls.icon} />
            <input
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={classNames(cls.input, {}, [])}
            />
        </div>
    );
};

export default InputSearch;
