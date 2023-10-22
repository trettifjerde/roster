export const translations = {
    en: {
        lang: 'ru',
        header: {
            title: 'Roster Calculator',
            description(link: JSX.Element) {
                return <>
                    <p>A {link} utility.</p>
                    <p>Assigns player squads to one of two competing sides on two servers.</p>
                    <p>Ensures side slots are balanced and squad preferences are taken into consideration.</p>
                </>
            }
        },
        calculations: {
            thisMightTake: 'This might take some time. Keep the tab open and go get some tea.',
            makingSides(n: number) {return <><p>Calculating possible sides...</p><p>Sides found: {n}</p></>},
            sidesFound(n: number) { return <><p>{n} possible sides found.</p><p>Calculating rosters...</p></>},
            rostersFound(n: number) {return <><p>Calculating rosters...</p><p>Rosters found: {n}</p></>},
            abortText: 'Abort'
        },
        rosterForm: {
            slots: {
                label: 'Max. side slot difference',
                description: 'Acceptable difference between side slots on one server'
            },
            happiness: {
                label: 'Min. side happiness',
                description: 'To exclude sides with total squad happiness lower than specified'
            },
        },
        common: {
            slots: 'Slots',
            squads: 'Squads',
            happiness: 'Happiness',
            rosters: 'Rosters'

        },
        rosters: {
            empty: 'No rosters',
            happy: 'Happy',
            unhappy: 'Unhappy',
            notFound: 'Rosters not found. Try lowering happiness level or allowing higher slot difference.'
        },
        squadGrid: {
            tag: 'Tag',
            deleteSquad: 'Delete squad',
            preferences: 'Preferences',
            with: 'With',
            without: 'Without',
        },
        btns: {
            formRoster: 'Form roster',
            yes: 'Yes',
            cancel: 'Cancel',
            save: 'Save',
            edit: 'Edit',
            addSquad :'Add squad',
            collapseSquads: 'Collapse squads',
            setDefault: 'Set default values'
        }
    },
    ru: {
        lang: 'en',
        header: {
            title: 'Калькулятор ротаций',
            description(link: JSX.Element) {
                return <>
                    <p>Утилита для {link}.</p>
                    <p>Распределяет отряды по сторонам двух серверов.</p>
                    <p>Учитывает предпочтения отрядов и следит за тем, чтобы баланс сторон был соблюден</p>
                </>
            }
        },
        calculations: {
            thisMightTake: 'Это займет некоторое время. Оставьте вкладку открытой и занимайтесь своими делами.',
            makingSides(n: number) {return <><p>Составляем стороны по введенным условиям...</p><p>Найдено сторон: {n}</p></>},
            sidesFound(n: number) {return <><p>Найдено {n} сторон с указанным уровнем счастья.</p><p>Составляем ротации...</p></>},
            rostersFound(n: number) {return <><p>Составляем ротации...</p><p>Найдено ротаций: {n}</p></>},
            abortText: 'Прервать'
        },
        rosterForm: {
            slots: {
                label: 'Макс. разница слотов',
                description: 'Допустимая разница в слотах между сторонами на одном сервере'
            },
            happiness: {
                label: 'Мин. счастье стороны',
                description: 'Чтобы исключить стороны, где суммарный уровень счастья отрядов ниже указанного'
            }
        },
        common: {
            slots: 'Слоты',
            squads: 'Отряды',
            happiness: 'Счастье',
            rosters: 'Ротации'

        },
        rosters: {
            empty: 'Нет ротаций',
            happy: 'Рады',
            unhappy: 'Не рады',
            notFound: 'Ротации не найдены. Попробуйте снизить уровень счастья или разрешить большую разницу слотов.'
        },
        squadGrid: {
            tag: 'Тэг',
            deleteSquad: 'Удалить отряд',
            preferences: 'Предпочтения',
            with: 'Вместе с',
            without: 'Без',
        },
        btns: {
            formRoster: 'Найти ротации',
            yes: 'Да',
            cancel: 'Отмена',
            save: 'Сохранить',
            edit: 'Изменить',
            addSquad :'Добавить отряд',
            collapseSquads: 'Свернуть все отряды',
            setDefault: 'Поставить по умолчанию'
        }
    }
}

export type Language = keyof typeof translations;