function getBrowserLanguage()
{
  const lang = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  return lang.split('-')[0].toLowerCase();
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
        const elements = document.querySelectorAll(".l10n");

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
        });
    }
    catch (error)
    {
        console.error("[l10n] Error loading translations: ", error);
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
        newsList.forEach(async item => {
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
            page.appendChild(itemNews);
        });
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
        downloadList.forEach(async item => {
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
                    itemDateDesc.textContent = "Build date: ";
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
            page.appendChild(itemDownload);
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
    const pageID = urlParams.get("page");
    if(pageID === "news" || pageID === null)
    {
        await getNews();
    }
    else if(pageID == "download")
    {
        await getDownload();
    }
}

async function initArchiveScript()
{
    await doPage();
    applyTranslations();
}