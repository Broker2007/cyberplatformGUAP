import { classNames } from 'shared/lib/classNames/classNames';
import ArrowsIcon from 'shared/assets/icons/arrows.svg';
import ArrowLeftIcon from 'shared/assets/icons/arrow_left2.svg';
import MemberIcon from 'shared/assets/icons/member.svg';
import MemberImg from 'shared/assets/image/member_icon_example.jpg';
import InputSearch from 'shared/ui/InputSearch/InputSearch';
import LabItem from 'shared/ui/LabItem/LabItem';
import { LabTemplate } from 'entities/labs/model/types/labs';
import { useState } from 'react';
import { SelectionBlock } from 'widgets/SelectionBlock';
import cls from './GroupsPage.module.scss';

interface GroupsPageProps {
    className?: string;
}

const GroupsPage = ({ className }: GroupsPageProps) => {
    const tasks:LabTemplate[] = [
        {
            id: '1',
            name: 'CCNA Routing Lab',
            description: {
                // eslint-disable-next-line max-len
                overview: 'Комплексная лабораторная работа по настройке протокола динамической маршрутизации OSPF в корпоративной сети. Студенты получат практический опыт конфигурации OSPF на нескольких маршрутизаторах, установления соседских отношений, управления областями OSPF и оптимизации параметров протокола для обеспечения быстрой сходимости и отказоустойчивости сети.',
                objectives: [
                    'Configure OSPF routing protocol on multiple routers',
                    'Establish neighbor relationships between OSPF routers',
                    'Verify OSPF routing table convergence',
                    'Troubleshoot OSPF adjacency issues',
                ],
                resources: [
                    {
                        title: 'Cisco OSPF Configuration Guide',
                        url: 'https://example.com/ospf-guide',
                    },
                    {
                        title: 'OSPF Network Design Solutions',
                        url: 'https://example.com/ospf-design',
                    },
                    {
                        title: 'Routing Protocol Comparison Chart',
                        url: 'https://example.com/routing-comparison',
                    },
                ],
            },
            difficulty: 'medium',
            tags: [
                'cisco',
                'routing',
                'ospf',
            ],
            eveNgTopologyId: 'topo_123',
            createdAt: '2024-01-15T10:30:00Z',
        },
        {
            id: '1',
            name: 'CCNA Routing Lab',
            description: {
                // eslint-disable-next-line max-len
                overview: 'Комплексная лабораторная работа по настройке протокола динамической маршрутизации OSPF в корпоративной сети. Студенты получат практический опыт конфигурации OSPF на нескольких маршрутизаторах, установления соседских отношений, управления областями OSPF и оптимизации параметров протокола для обеспечения быстрой сходимости и отказоустойчивости сети.',
                objectives: [
                    'Configure OSPF routing protocol on multiple routers',
                    'Establish neighbor relationships between OSPF routers',
                    'Verify OSPF routing table convergence',
                    'Troubleshoot OSPF adjacency issues',
                ],
                resources: [
                    {
                        title: 'Cisco OSPF Configuration Guide',
                        url: 'https://example.com/ospf-guide',
                    },
                    {
                        title: 'OSPF Network Design Solutions',
                        url: 'https://example.com/ospf-design',
                    },
                    {
                        title: 'Routing Protocol Comparison Chart',
                        url: 'https://example.com/routing-comparison',
                    },
                ],
            },
            difficulty: 'medium',
            tags: [
                'cisco',
                'routing',
                'ospf',
            ],
            eveNgTopologyId: 'topo_123',
            createdAt: '2024-01-15T10:30:00Z',
        },
        {
            id: '1',
            name: 'CCNA Routing Lab',
            description: {
                // eslint-disable-next-line max-len
                overview: 'Комплексная лабораторная работа по настройке протокола динамической маршрутизации OSPF в корпоративной сети. Студенты получат практический опыт конфигурации OSPF на нескольких маршрутизаторах, установления соседских отношений, управления областями OSPF и оптимизации параметров протокола для обеспечения быстрой сходимости и отказоустойчивости сети.',
                objectives: [
                    'Configure OSPF routing protocol on multiple routers',
                    'Establish neighbor relationships between OSPF routers',
                    'Verify OSPF routing table convergence',
                    'Troubleshoot OSPF adjacency issues',
                ],
                resources: [
                    {
                        title: 'Cisco OSPF Configuration Guide',
                        url: 'https://example.com/ospf-guide',
                    },
                    {
                        title: 'OSPF Network Design Solutions',
                        url: 'https://example.com/ospf-design',
                    },
                    {
                        title: 'Routing Protocol Comparison Chart',
                        url: 'https://example.com/routing-comparison',
                    },
                ],
            },
            difficulty: 'medium',
            tags: [
                'cisco',
                'routing',
                'ospf',
            ],
            eveNgTopologyId: 'topo_123',
            createdAt: '2024-01-15T10:30:00Z',
        },
        {
            id: '1',
            name: 'CCNA Routing Lab',
            description: {
                // eslint-disable-next-line max-len
                overview: 'Комплексная лабораторная работа по настройке протокола динамической маршрутизации OSPF в корпоративной сети. Студенты получат практический опыт конфигурации OSPF на нескольких маршрутизаторах, установления соседских отношений, управления областями OSPF и оптимизации параметров протокола для обеспечения быстрой сходимости и отказоустойчивости сети.',
                objectives: [
                    'Configure OSPF routing protocol on multiple routers',
                    'Establish neighbor relationships between OSPF routers',
                    'Verify OSPF routing table convergence',
                    'Troubleshoot OSPF adjacency issues',
                ],
                resources: [
                    {
                        title: 'Cisco OSPF Configuration Guide',
                        url: 'https://example.com/ospf-guide',
                    },
                    {
                        title: 'OSPF Network Design Solutions',
                        url: 'https://example.com/ospf-design',
                    },
                    {
                        title: 'Routing Protocol Comparison Chart',
                        url: 'https://example.com/routing-comparison',
                    },
                ],
            },
            difficulty: 'medium',
            tags: [
                'cisco',
                'routing',
                'ospf',
            ],
            eveNgTopologyId: 'topo_123',
            createdAt: '2024-01-15T10:30:00Z',
        },
        {
            id: '1',
            name: 'CCNA Routing Lab',
            description: {
                // eslint-disable-next-line max-len
                overview: 'Комплексная лабораторная работа по настройке протокола динамической маршрутизации OSPF в корпоративной сети. Студенты получат практический опыт конфигурации OSPF на нескольких маршрутизаторах, установления соседских отношений, управления областями OSPF и оптимизации параметров протокола для обеспечения быстрой сходимости и отказоустойчивости сети.',
                objectives: [
                    'Configure OSPF routing protocol on multiple routers',
                    'Establish neighbor relationships between OSPF routers',
                    'Verify OSPF routing table convergence',
                    'Troubleshoot OSPF adjacency issues',
                ],
                resources: [
                    {
                        title: 'Cisco OSPF Configuration Guide',
                        url: 'https://example.com/ospf-guide',
                    },
                    {
                        title: 'OSPF Network Design Solutions',
                        url: 'https://example.com/ospf-design',
                    },
                    {
                        title: 'Routing Protocol Comparison Chart',
                        url: 'https://example.com/routing-comparison',
                    },
                ],
            },
            difficulty: 'medium',
            tags: [
                'cisco',
                'routing',
                'ospf',
            ],
            eveNgTopologyId: 'topo_123',
            createdAt: '2024-01-15T10:30:00Z',
        },
    ];

    const [isGroupsOpen, setIsGroupsOpen] = useState(false);

    return (
        <div className={classNames(cls.GroupsPage, {}, [className])}>
            <div className={cls.main_block}>
                <div className={cls.block_selections}>
                    <div className={cls.block_groups}>
                        <div
                            className={classNames(cls.section_choise, { [cls.active]: isGroupsOpen }, [])}
                            onClick={() => setIsGroupsOpen(!isGroupsOpen)}
                        >
                            <div
                                className={cls.left_block_section_choise}

                            >
                                <ArrowsIcon className={cls.arrows_icon} />
                                <p className={cls.text_choise}>Выбрать группу</p>
                            </div>
                            <ArrowLeftIcon className={cls.arrow_left2_icon} />
                        </div>
                        <SelectionBlock
                            type="groups"
                            collapsed={!isGroupsOpen}
                            setCollapsed={setIsGroupsOpen}
                            onItemClick={() => setIsGroupsOpen(true)}
                        />
                    </div>
                    <SelectionBlock
                        type="members"
                        collapsed={isGroupsOpen}
                        setCollapsed={setIsGroupsOpen}
                        className={cls.memberStyle}
                    />
                </div>
                <div className={cls.block_content}>
                    <InputSearch
                        placeholder="Поиск сообщения..."
                        className={classNames(cls.input, {}, ['w-100'])}
                    />
                    {/* блок таски */}
                    <div className={cls.tasks}>
                        {tasks.map((lab, index) => (
                            <div className={cls.task}>
                                <div className={cls.head_block_task}>
                                    <div className={cls.left_block_task}>
                                        <img src={MemberImg} alt="иконка группы" className={cls.member_img} />
                                        <div className={cls.text_member}>
                                            <div className={cls.block_title_text_member}>
                                                <p className={cls.title_member}>МакТрахер</p>
                                                <MemberIcon className={cls.member_icon} />
                                            </div>
                                            <p className={cls.role_member}>Преподаватель</p>
                                        </div>
                                    </div>
                                    <div className={cls.right_block_task}>
                                        <p className={cls.text_publish}>Опубликовано 17:52 27.10.2025</p>
                                    </div>
                                </div>
                                <LabItem
                                    className={classNames(cls.lab_item, {}, ['pr-15 mt-10'])}
                                    key={lab.id}
                                    id={lab.id}
                                    difficulty={lab.difficulty}
                                    tags={lab.tags}
                                    status="Решена"
                                    opened
                                    title={lab.name}
                                    description={lab.description}
                                />
                                <div className={cls.message}>
                                    <p className={cls.title_message}>Сообщение</p>
                                    <p className={cls.text_message}>
                                        Данная лабораторная работа для истинных хакеров
                                        и для тех, кто играет в Dota 2...Осуждаем
                                    </p>
                                </div>
                            </div>

                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default GroupsPage;
