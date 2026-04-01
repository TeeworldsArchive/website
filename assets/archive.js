function getBrowserLanguage()
{
  const lang = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  return lang.split('-')[0].toLowerCase();
}

function hideElement(element)
{
    element.classList.add("preload");
}

async function applyTranslations()
{
    const lang = getBrowserLanguage();
    if(lang == "en")
        return;
    const localeUrl = `/assets/l10n/${encodeURIComponent(lang)}.json`;

    try
    {
        const response = await fetch(localeUrl);
        if(!response.ok)
        {
            throw new Error(`Failed to load translations for language: ${lang}`);
        }
        const translationList = await response.json();
        const translationMap = new Map();
        translationList.forEach(item => {
            translationMap.set(item.key, item.value);
        });
        let elements = document.querySelectorAll(".l10n");

        elements.forEach(element =>
        {
            const originalText = element.textContent.trim();
            const translated = translationMap.get(originalText);

            if (translated !== undefined)
            {
                element.textContent = translated;
            }
            else
            {
                console.warn(`No translation found for: '${originalText}'`);
            }
        })
    }
    catch (error)
    {
        console.warn("[l10n] Error loading translations: ", error);
    }
}

async function getNews()
{
    const lang = getBrowserLanguage();

    try
    {
        const response = await fetch("/assets/news/index.json");
        if(!response.ok)
        {
            throw new Error("Couldn't fetch index.json");
        }
        const newsList = await response.json();
        const page = document.getElementById("page");
        const markdown = markdownit({html: true, linkify: true, typographer: true})
        for(const item of newsList) 
        {
            const itemNews = document.createElement("div");
            itemNews.className = "news"
            {
                const itemTitle = document.createElement("h1");
                itemTitle.textContent = item.title;
                itemTitle.className = "l10n";
                itemNews.appendChild(itemTitle);
            }
            {
                const itemDate = document.createElement("p");
                itemDate.className = "date-author";
                itemDate.textContent = `${item.date} by ${item.postby}`;
                itemNews.appendChild(itemDate);
            }
            let textResponse = await fetch(`/assets/news/${item.date}.${lang}.md`);
            if(!textResponse.ok)
            {
                textResponse = await fetch(`/assets/news/${item.date}.en.md`);
                if(!textResponse.ok)
                {
                    throw new Error(`Couldn't fetch ${textResponse.url}`);
                }
            }
            const text = await textResponse.text();
            {
                const itemText = document.createElement("p");
                itemText.innerHTML = markdown.render(text);
                itemNews.appendChild(itemText);
            }
            hideElement(itemNews);
            page.appendChild(itemNews);
        };
    }
    catch (error)
    {
        console.error("[News] Could not get news list: ", error);
    }
}

async function getDownload()
{
    const lang = getBrowserLanguage();

    try
    {
        let response = await fetch(`/assets/download/${lang}.json`);
        if(!response.ok)
        {
            response = await fetch("/assets/download/en.json");
            if(!response.ok)
            {
                throw new Error(`Couldn't fetch ${response.url}`);
            }
        }
        const downloadList = await response.json();
        const page = document.getElementById("page");
        downloadList.forEach(item => {
            const itemDownload = document.createElement("div");
            itemDownload.className = "download"
            {
                const itemDownloadLinks = document.createElement("div");
                itemDownloadLinks.className = "download-links"
                {
                    const itemWindows = document.createElement("a");
                    itemWindows.textContent = "Windows (amd64)";
                    itemWindows.href = item.windows;
                    itemDownloadLinks.appendChild(itemWindows);
                }
                {
                    const itemLinux = document.createElement("a");
                    itemLinux.textContent = "Linux (amd64)";
                    itemLinux.href = item.linux;
                    itemDownloadLinks.appendChild(itemLinux);
                }
                {
                    const itemMacOS = document.createElement("a");
                    itemMacOS.textContent = "MacOS (arm64)";
                    itemMacOS.href = item.macos;
                    itemDownloadLinks.appendChild(itemMacOS);
                }
                {
                    const itemSource = document.createElement("a");
                    itemSource.className = "l10n";
                    itemSource.textContent = "Source (zip)";
                    itemSource.href = item.source_zip;
                    itemDownloadLinks.appendChild(itemSource);
                }
                {
                    const itemSource = document.createElement("a");
                    itemSource.className = "l10n";
                    itemSource.textContent = "Source (tar.gz)";
                    itemSource.href = item.source_tar;
                    itemDownloadLinks.appendChild(itemSource);
                }
                itemDownload.appendChild(itemDownloadLinks);
            }
            {
                const itemDownloadInfo = document.createElement("div");
                itemDownloadInfo.className = "download-info"
                {
                    const itemVersion = document.createElement("h1");
                    itemVersion.textContent = item.version;
                    itemDownloadInfo.appendChild(itemVersion);
                }
                {
                    const itemDateDesc = document.createElement("p");
                    itemDateDesc.className = "date l10n";
                    itemDateDesc.textContent = "Build date:";
                    itemDownloadInfo.appendChild(itemDateDesc);
                }
                {
                    const itemDate = document.createElement("p");
                    itemDate.className = "date";
                    itemDate.textContent = item.date;
                    itemDownloadInfo.appendChild(itemDate);
                }
                itemDownloadInfo.appendChild(document.createElement("div"));
                {
                    const itemDescription = document.createElement("p");
                    itemDescription.className = "description";
                    itemDescription.textContent = item.description;
                    itemDownloadInfo.appendChild(itemDescription);
                }
                itemDownload.appendChild(itemDownloadInfo);
            }
            hideElement(itemDownload);
            page.appendChild(itemDownload);
        });
    }
    catch (error)
    {
        console.error("[Download] Could not get news list: ", error);
    }
}

async function getContact()
{
    const lang = getBrowserLanguage();

    try
    {
        let response = await fetch(`/assets/contact/${lang}.json`);
        if(!response.ok)
        {
            response = await fetch("/assets/contact/en.json");
            if(!response.ok)
            {
                throw new Error(`Couldn't fetch ${response.url}`);
            }
        }
        const contactList = await response.json();
        const page = document.getElementById("page");
        contactList.forEach(item => {
            const itemContact = document.createElement("div");
            itemContact.className = "contact"
            {
                const itemName = document.createElement("h1");
                itemName.textContent = item.nickname;
                itemContact.appendChild(itemName);
            }
            {
                const itemPosition = document.createElement("p");
                itemPosition.className = "position";
                itemPosition.textContent = item.position;
                itemContact.appendChild(itemPosition);
            }
            {
                const itemList = document.createElement("div");

                const itemIngameNameDesc = document.createElement("p");
                itemIngameNameDesc.className = "ingame l10n";
                itemIngameNameDesc.textContent = "Ingame Name:";
                itemList.appendChild(itemIngameNameDesc);

                const itemName = document.createElement("p");
                itemName.className = "ingame";
                itemName.textContent = item.ingame_name;
                itemList.appendChild(itemName);

                itemContact.appendChild(itemList)
            }
            if(item.email != null)
            {
                const itemList = document.createElement("div");

                const itemEmailDesc = document.createElement("p");
                itemEmailDesc.className = "email l10n";
                itemEmailDesc.textContent = "Email:";
                itemList.appendChild(itemEmailDesc);

                const itemEmail = document.createElement("p");
                itemEmail.className = "email";
                itemEmail.textContent = item.email;
                itemList.appendChild(itemEmail);

                itemContact.appendChild(itemList)
            }
            {
                const itemOthers = document.createElement("p");
                itemOthers.className = "others";
                itemOthers.textContent = item.others;
                itemContact.appendChild(itemOthers);
            }
            hideElement(itemContact);
            page.appendChild(itemContact);
        });
    }
    catch (error)
    {
        console.error("[Download] Could not get news list: ", error);
    }
}

async function doPage()
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const pageID = urlParams.get("page") ?? "news";
    if(pageID === "news")
    {
        await getNews();
    }
    else if(pageID == "download")
    {
        await getDownload();
    }
    else if(pageID == "contact")
    {
        await getContact();
    }
}

async function initArchiveScript()
{
    await doPage();
    await applyTranslations();

    elements = document.querySelectorAll(".preload");
    elements.forEach(element =>
    {
        element.classList.remove("preload");
    });
}