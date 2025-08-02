// await $`
// export GIT_CLIFF_TEMPLATE='\
// 	{% for group, commits in commits | group_by(attribute=\"group\") %}
// 	{{ group | upper_first }}\
// 	{% for commit in commits %}
// 		- {% if commit.breaking %}(breaking) {% endif %}{{ commit.message | upper_first }} ({{ commit.id | truncate(length=7, end=\"\") }})\
// 	{% endfor %}
// 	{% endfor %}'
// `.exportEnv();

// const changeLog = await $
// 	.raw`git-cliff --tag ${tag} --config detailed --unreleased --strip all`
// 	.text();

// await $.raw`git
//   -c user.name=github-actions[bot] \
//   -c user.email=github-actions[bot]@users.noreply.github.com \
//   tag -f -a "${tag}" -m "Release ${tag}" -m "${changeLog}"`;
