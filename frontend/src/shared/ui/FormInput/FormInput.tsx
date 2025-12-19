import {
    FormHelperText,
    Typography,
    FormControl,
    Input as _Input,
    InputProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import cls from './FormInput.module.scss';
// Стилизуем Input как в компоненте 2, но используя styled из MUI
const Input = styled(_Input)`
  width: 100%;
  background-color: transparent;
  border: 1px solid #525252;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 0;
  font-size: 16px;
  outline: none;
  color: #fff;
  z-index: 140;
  caret-color: #fff;
  opacity: 0.5 ;

  &::placeholder {
    color: #525252;
    font-size: 16px;
    
  }

  &:hover{
    opacity: 1;
  }

  &:focus-within {
    position: relative;
    border: 1px solid var(--green-color);
    border-image-slice: 1;
    border-width: 1px;
  }

  & input:-webkit-autofill,
  & input:-webkit-autofill:hover,
  & input:-webkit-autofill:focus,
  & input:-webkit-autofill:active {
    -webkit-text-fill-color: #ffffff !important;
    -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
    /* ИЛИ ваш полупрозрачный фон: */
    /* -webkit-box-shadow: 0 0 0 1000px rgb(10 10 15 / 50%) inset !important; */
    transition: background-color 9999s ease-in-out 0s !important;
    caret-color: #fff !important;
  }

  &:focus input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px rgb(10 10 15 / 70%) inset !important;
    box-shadow: 0 0 0px 1000px rgb(10 10 15 / 70%) inset !important;
    background-color: transparent !important;
    caret-color: #fff !important;
    font-size: 16px;
  }

  // Стили для ошибки
  &.Mui-error {
    border-color: #ff4757;
    background: rgb(255 71 87 / 10%);
    margint-top:20px;
    &:focus {
      border-color: #ff4757;
      background: rgb(255 71 87 / 15%);
      caret-color: #fff; /* Курсор при ошибке */
    }

    & input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0px 1000px rgb(255 71 87 / 10%) inset !important;
      box-shadow: 0 0 0px 1000px rgb(255 71 87 / 10%) inset !important;
      caret-color: #fff !important;
    }
  }
`;

type IFormInputProps = {
  name: string;
  label?: string;
} & InputProps;

const FormInput: FC<IFormInputProps> = ({ name, label = undefined, ...otherProps }) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    return (
        <Controller
            control={control}
            defaultValue=""
            name={name}
            render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                    {label && <p className={cls.label}>{label}</p>}
                    <Input
                        {...field}
                        fullWidth
                        disableUnderline
                        error={!!errors[name]}
                        {...otherProps}
                    />
                    <FormHelperText
                        error={!!errors[name]}
                        sx={{
                            color: '#ff4757',
                            fontSize: '14px',
                            textAlign: 'left',
                            padding: '0 8px',
                            marginTop: '0px',
                            marginBottom: '0px',
                        }}
                    >
                        {errors[name] ? String(errors[name]?.message) : ''}
                    </FormHelperText>
                </FormControl>
            )}
        />
    );
};

export default FormInput;
