/* eslint-disable react/no-array-index-key */
import { classNames } from 'shared/lib/classNames/classNames';
import GroupItem from 'shared/ui/GroupItem/GroupItem';
import MemberItem from 'shared/ui/MemberItem/MemberItem';
import cls from './SelectionBlock.module.scss';

interface SelectionBlockProps {
    className?: string;
    collapsed?: boolean;
    setCollapsed?: (prev: boolean) => void;
    type: 'groups' | 'members';
    title?: string;
    showHeader?: boolean;
    onItemClick?: () => void;
}

const SelectionBlock = ({
    className,
    collapsed,
    setCollapsed,
    type,
    title,
    showHeader = true,
    onItemClick,
}: SelectionBlockProps) => {
    const renderContent = () => {
        if (type === 'groups') {
            return (
                <>
                    <GroupItem mainBool />
                    <div className={cls.block_main_list}>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div
                                key={index}
                                className={cls.memberWrapper}
                                onClick={onItemClick}
                            >
                                <GroupItem />
                            </div>
                        ))}
                    </div>
                </>
            );
        }
        return (
            <>
                <GroupItem mainBool />
                <div className={cls.block_main_list}>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <MemberItem key={index} />
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className={classNames(cls.block_members, { [cls.collapsed]: collapsed }, [className])}>
            {renderContent()}
        </div>
    );
};

export default SelectionBlock;
