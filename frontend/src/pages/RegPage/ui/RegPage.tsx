import { styled } from '@mui/material/styles';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingButton as _LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import FormInput from 'shared/ui/FormInput/FormInput';
import { classNames } from 'shared/lib/classNames/classNames';
import Logo from 'shared/assets/icons/logo.svg';
import BackIcon from 'shared/assets/icons/arrow_left2.svg';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import { Button } from 'shared/ui/Button/Button';
import { useDispatch } from 'react-redux';
import { useRegisterUserMutation } from 'features/auth/api/authApi';
import { Loader } from 'shared/ui/Loader/Loader';
import { Password } from 'shared/ui/Input/Input.stories';
import cls from '../../LoginPage/ui/LoginPage.module.scss';

const LoadingButton = styled(_LoadingButton)`
  margin-top: 22px;
  margin-bottom: 0;
  height:57px;
  display:flex;
  justify-content:center;
  width: 100%;
  color: white;
  font-weight: 400;
  font-size: 16px;
  border-radius: 20px;
  text-transform: none;

  &:disabled {
    opacity: 0.6;
  }
`;

const LinkItem = styled(Link)`
  color: #5C8662 !important;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const registerSchema = object({
    fullName: string().min(1, 'Требуется полное имя').max(100),
    email: string()
        .min(1, 'Требуется адрес электронной почты')
        .email('Адрес электронной почты неправильный'),
    password: string()
        .min(1, 'Введите пароль')
        .min(8, 'Пароль должен быть более 8 символов')
        .max(32, 'Пароль должен быть меньше 32 символов'),
    passwordConfirm: string().min(1, 'Пожалуйста, повторите свой пароль'),
}).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Пароли не совпадают',
});

export type RegisterInput = TypeOf<typeof registerSchema>;
export type RegisterPayload = {
    fullName: string,
    email: string,
    password:string
};

const RegPage = () => {
    const methods = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const [registerUser, {
        isLoading, isSuccess, error, isError, data,
    }] = useRegisterUserMutation();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        reset,
        handleSubmit,
        formState: { isSubmitSuccessful },
    } = methods;

    useEffect(() => {
        if (isSuccess && data) {
            toast.success('Пользователь успешно зарегистрирован');
            navigate('/login');
        }

        if (isError) {
            console.log(error);
            if (Array.isArray((error as any).data?.error)) {
                (error as any).data.error.forEach((el: any) => toast.error(el.message, { position: 'top-right' }));
            } else {
                toast.error((error as any).data?.message || 'Ошибка регистрации', {
                    position: 'top-right',
                });
            }
        }
    }, [isSuccess, isError, error, data, dispatch, navigate]);

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset();
        }
    }, [isSubmitSuccessful, reset]);

    const onSubmitHandler: SubmitHandler<RegisterInput> = (values) => {
        const registerData = {
            fullName: values.fullName,
            email: values.email,
            password: values.password,
        };
        registerUser(registerData);
    };

    return (
        <div className={classNames(cls.ModalIntel, {}, [])}>
            <div className={cls.glow_left} />
            <div className={cls.glow_right} />

            <Button
                theme={ThemeButton.INLINE}
                className={cls.back_btn}
                onClick={() => navigate('/')}
            >
                <BackIcon className={cls.arrow_icon} />
                <p className={cls.text_arrow_btn}>Назад</p>
            </Button>

            <div className={cls.modal_container}>
                <div className="d-f jc-cen ai-cen">
                    <div className={cls.main_form}>
                        <div className={cls.block_logo}>
                            <Logo className={cls.logo} />
                        </div>
                        <p className={cls.text_hello}>Создать аккаунт</p>
                        <p className={cls.register_text}>
                            Уже есть аккаунт
                            <LinkItem to="/login"> Войдите </LinkItem>
                            бесплатно
                        </p>

                        <FormProvider {...methods}>
                            <form
                                onSubmit={handleSubmit(onSubmitHandler)}
                                noValidate
                                autoComplete="off"
                                className={cls.form}
                            >
                                <div className={cls.inputs_container}>
                                    <FormInput
                                        name="fullName"
                                        placeholder="Логин/Никнейм"
                                    />
                                    <FormInput
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                    />
                                    <FormInput
                                        name="password"
                                        type="password"
                                        placeholder="Пароль"
                                    />
                                    <FormInput
                                        name="passwordConfirm"
                                        type="password"
                                        placeholder="Повторите пароль"
                                    />
                                </div>

                                <LoadingButton
                                    fullWidth
                                    disableElevation
                                    type="submit"
                                    loading={isLoading}
                                    className={cls.login_button}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader /> : 'Регистрация'}
                                </LoadingButton>
                            </form>
                        </FormProvider>
                    </div>
                </div>

                <div className={cls.block2}>
                    <span className={cls.line} />
                    <div className="d-f jc-cen ai-cen">
                        <p className={cls.polit}>
                            Нажимая «Регистрация», вы принимаете пользовательское соглашение и
                            политику конфиденциальности
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegPage;
