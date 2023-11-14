export const translations = {
    en: {
        lang: 'ru',
        header: {
            title: 'Roster Calculator',
            description(link: JSX.Element) {
                return <>
                    <p>A {link} utility.</p>
                    <p>Assigns player squads to one of the two competing sides on two servers.</p>
                    <p>Ensures side slots are balanced and squad preferences are taken into consideration.</p>
                </>
            }
        },
        calculations: {
            thisMightTake: 'This might take some time. Keep the tab open and go get some tea.',
            makingSides(n: number) {return <><p>Calculating possible sides...</p><p>Sides found: {n}</p></>},
            sidesFound(n: number) { return <><p>{n} possible sides found.</p><p>Calculating rosters...</p></>},
            abortText: 'Abort'
        },
        rosterForm: {
            form: {
                slots: {
                    label: 'Max. side slot difference',
                    description: "Acceptable difference between side slots on one server",
                    invalid: 'Invalid slot difference'
                },
                happiness: {
                    label: 'Min. average happiness',
                    description: "Calculated for each side: sum of each squad's happiness divided by the number of squads. Specify to exclude sides with average happiness lower than needed",
                    invalid: 'Invalid min. average happiness'
                },
                happy: {
                    label: 'Happy points',
                    description: 'Points added to squad happiness if they are on the same side with a squad they want to play with',
                    invalid: 'Invalid happy points'
                },
                unhappy: {
                    label: 'Unhappy points',
                    description: 'Points substracted from squad happiness if they are on the same side with a squad they do not want to play with',
                    invalid: 'Invalid unhappy points'
                },
                unwanted: {
                    label: 'Max. unwanted squads',
                    description: 'Leave turned off or specify how many squads from their "do not want to play with" list a squad may end up playing with',
                    invalid: 'Invalid unwanted squads'
                }
            },
            rangeError(label: string, min: number, max: number) {return min === max ? `${label} for these squads = ${min}` : 
            `${label} for these squads: ${min} <= x <= ${max}`},

            unknownError: 'Unknown error'
        },
        common: {
            slots: 'Slots',
            squads: 'Squads',
            happiness: 'Happiness',
            rosters: 'Rosters',
            yes: 'Yes',
            cancel: 'Cancel',
            save: 'Save',
        },
        rosters: {
            empty: 'No rosters',
            happy: 'Happy',
            unhappy: 'Unhappy',
            notFound: 'Rosters not found. Try lowering happiness level or allowing higher slot difference.'
        },
        squads: {
            newSquad: 'new squad',
            fileError: 'Unable to read the file. Please, download the default squads to see how data should be structured in order to be read.',
            importConfHeader: 'Attention',
            importConfBody: <><p>The information from the file will completely rewrite the current squads info in the application. If you do not want to lose the current squads info, click "Cancel" and "Export squads info" first.</p>
                <br/><p>Do you want to upload your file to the app now?</p>
            </>
        },
        squadsForm: {
            tag: 'Tag',
            deleteSquad: 'Delete squad',
            preferences: 'Preferences',
        },
        squadItem: {
            with: 'With',
            without: 'Without',
            edit: 'Edit',
        },
        btns: {
            formRoster: 'Form roster',
            collapseSquads: 'Collapse squads',
            setDefault: 'Set default values',
            export: 'Export squads info',
            import: 'Upload squads info'
        }
    },
    ru: {
        lang: 'en',
        header: {
            title: 'Калькулятор ротаций',
            description(link: JSX.Element) {
                return <>
                    <p>Утилита для {link}.</p>
                    <p>Распределяет игровые отряды по сторонам двух серверов.</p>
                    <p>Учитывает предпочтения отрядов и следит за тем, чтобы баланс сторон был соблюден</p>
                </>
            }
        },
        calculations: {
            thisMightTake: 'Это займет некоторое время. Оставьте вкладку открытой и занимайтесь своими делами.',
            makingSides(n: number) {return <><p>Составляем стороны по введенным условиям...</p><p>Найдено сторон: {n}</p></>},
            sidesFound(n: number) {return <><p>Найдено {n} сторон с указанным уровнем счастья.</p><p>Составляем ротации...</p></>},
            abortText: 'Прервать'
        },
        rosterForm: {
            form: {
                slots : {
                    label: 'Макс. разница слотов',
                    description: 'Допустимая разница в слотах между сторонами на одном сервере',
                    invalid: 'Недопустимое значение разницы слотов'
                },
                happiness: {
                    label: 'Мин. среднее счастье отрядов',
                    description: 'Сумма счастья отрядов, деленная на их количество. Укажите, чтобы исключить стороны, где средний уровень счастья отрядов ниже необходимого',
                    invalid: 'Недопустимое значение мин. счастья',
                },
                happy: {
                    label: 'Очки счастья',
                    description: 'Сколько очков добавлять к счастью отряда, если он играет на одной стороне с отрядом, с которым хочет',
                    invalid: 'Недопустимое значение очков счастья'
                },
                unhappy: {
                    label: 'Очки недовольства',
                    description: 'Сколько очков вычитать из счастья отряда, если он играет на одной стороны с отрядом, с которым не хочет играть',
                    invalid: 'Недопустимое значение очков недовольства'
                },
                unwanted: {
                    label: 'Макс. нежелательных отрядов',
                    description: 'Оставьте отключенным или укажите, с каким количеством отрядов из списка нежелательных отряд может играть на одной стороне',
                    invalid: 'Недопустимое значение нежелательных отрядов'
                }
            },
            rangeError(label: string, min: number, max: number) {return min === max ? `${label} для этих отрядов = ${min}` : 
            `${label} для этих отрядов: ${min} <= x <= ${max}`},

            unknownError: 'Неизвестная ошибка'
        },
        common: {
            slots: 'Слоты',
            squads: 'Отряды',
            happiness: 'Счастье',
            rosters: 'Ротации',
            yes: 'Да',
            cancel: 'Отмена',
            save: 'Сохранить',
        },
        rosters: {
            empty: 'Нет ротаций',
            happy: 'Рады',
            unhappy: 'Не рады',
            notFound: 'Ротации не найдены. Попробуйте снизить уровень счастья или разрешить большую разницу слотов.'
        },
        squads: {
            newSquad: 'новый отряд',
            fileError: 'Файл не соответствует формату. Скачайте дефолтные отряды и посмотрите, каким должен быть формат.',
            importConfHeader: 'Внимание',
            importConfBody: <><p>Отряды из загруженного файла полностью перезапишут собой отряды в приложении. Если вы не хотите потерять текущую информацию, нажмите "Отмена" и "Скачать отряды", а потом повторите импорт.</p>
                <br/><p>Импортировать отряды из файла сейчас?</p>
            </>
        },
        squadsForm: {
            tag: 'Тэг',
            deleteSquad: 'Удалить отряд',
            preferences: 'Предпочтения',
        },
        squadItem: {
            edit: 'Изменить',
            with: 'Вместе с',
            without: 'Без',
        },
        btns: {
            formRoster: 'Найти ротации',
            collapseSquads: 'Свернуть все отряды',
            setDefault: 'Поставить по умолчанию',
            export: 'Скачать отряды',
            import: 'Импортировать отряды'
        }
    }
}

export type Language = keyof typeof translations;
export type RosterFormUI = typeof translations.en.rosterForm;