import { styled } from '@mui/material/styles';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoadingButton as _LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import FormInput from 'shared/ui/FormInput/FormInput';
import { classNames } from 'shared/lib/classNames/classNames';
import Logo from 'shared/assets/icons/logo.svg';
import { Button } from 'shared/ui/Button/Button';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import BackIcon from 'shared/assets/icons/arrow_left2.svg';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import { useLoginUserMutation } from 'features/auth/api/authApi';
import { useGetMeQuery } from 'entities/user/api/userApi';
import { Loader } from 'shared/ui/Loader/Loader';
import cls from './LoginPage.module.scss';

const LoadingButton = styled(_LoadingButton)`
  margin-top: 5px;
  height: 57px;
  width: 100%;
  color: white;
  font-size: 16px;
  border-radius: 20px;
  text-transform: none;

  &:disabled {
    opacity: 0.6;
  }
`;

const LinkItem = styled(Link)`
  color: #5c8662 !important;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const loginSchema = object({
    email: string()
        .min(1, 'Email обязателен')
        .email('Некорректный email'),
    password: string()
        .min(1, 'Пароль обязателен')
        .min(8, 'Минимум 8 символов')
        .max(32, 'Максимум 32 символа'),
});

export type LoginInput = TypeOf<typeof loginSchema>;

const getErrorMessage = (err: any): string => {
    if (!err) return 'Неизвестная ошибка';

    if (err.data) {
        if (typeof err.data === 'string') return err.data;
        if (err.data.message) return err.data.message;
        if (err.data.error) return err.data.error;
    }

    if (err.error) return err.error;

    return 'Ошибка авторизации';
};

const LoginPage = () => {
    const methods = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const [loginUser, { isLoading }] = useLoginUserMutation();

    const { data: user, isLoading: isUserLoading } = useGetMeQuery();
    const navigate = useNavigate();
    const location = useLocation();

    const from = ((location.state as any)?.from?.pathname as string) || '/profile';

    const {
        reset,
        handleSubmit,
        setError,
    } = methods;

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const onSubmitHandler: SubmitHandler<LoginInput> = async (values) => {
        try {
            await loginUser(values).unwrap();

            toast.success('Вы успешно вошли');
            reset();
            navigate(from, { replace: true });
        } catch (err: any) {
            const message = getErrorMessage(err);

            toast.error(message);

            setError('root', {
                type: 'manual',
                message,
            });

            if (message.toLowerCase().includes('email') || message.toLowerCase().includes('user')) {
                setError('email', {
                    type: 'manual',
                    message,
                });
            } else if (message.toLowerCase().includes('password')) {
                setError('password', {
                    type: 'manual',
                    message,
                });
            }
        }
    };

    if (isUserLoading) {
        return (
            <div className="d-f jc-cen ai-cen w-100 h-100">
                <PageLoader />
            </div>
        );
    }

    if (user) return null;

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

                        <p className={cls.text_hello}>Рады вас снова видеть!</p>

                        <p className={cls.register_text}>
                            В первый раз?
                            <LinkItem to="/register"> Зарегистрируйтесь </LinkItem>
                            {' '}
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
                                    <FormInput name="email" type="email" placeholder="Ваша почта" />
                                    <FormInput name="password" type="password" placeholder="Пароль" />
                                </div>

                                {methods.formState.errors.root && (
                                    <div style={{
                                        color: '#d32f2f',
                                        fontSize: '14px',
                                        marginTop: '8px',
                                        textAlign: 'center',
                                        backgroundColor: '#ffebee',
                                        padding: '8px',
                                        borderRadius: '8px',
                                    }}
                                    >
                                        {methods.formState.errors.root.message}
                                    </div>
                                )}

                                <LoadingButton
                                    type="submit"
                                    loading={isLoading}
                                    className={cls.login_button}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader /> : 'Войти'}
                                </LoadingButton>
                            </form>
                        </FormProvider>
                    </div>
                </div>

                <div className={cls.block2}>
                    <span className={cls.line} />
                    <div className="d-f jc-cen ai-cen">
                        <p className={cls.polit}>
                            Нажимая «Войти», вы принимаете пользовательское соглашение
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
