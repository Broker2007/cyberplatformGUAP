import { classNames } from 'shared/lib/classNames/classNames';
import BasketIcon from 'shared/assets/icons/basket.svg';
import MemberImg from 'shared/assets/image/member_icon_example.jpg';
import MemberIcon from 'shared/assets/icons/member.svg';
import cls from './MemberItem.module.scss';

interface MemberItemProps {
    className?: string,
}

const MemberItem = ({ className }:MemberItemProps) => {
    const a = 123;
    return (
        <div className={classNames(cls.block_member, {}, [className])}>
            <div className={cls.left_block}>
                <img src={MemberImg} alt="иконка участника" className={cls.member_img} />
                <div className={cls.text}>
                    <div className={cls.head_block}>
                        <p className={cls.title}>МакТрахер</p>
                        <MemberIcon className={cls.member_icon} />
                    </div>
                    <p className={cls.role}>Участник</p>
                </div>
            </div>
            <div className={cls.right_block}>
                <p className={cls.text_invite}>Присоединился: 27.10.2025</p>
                <BasketIcon className={cls.basket_icon} />
            </div>
        </div>
    );
};
export default MemberItem;
